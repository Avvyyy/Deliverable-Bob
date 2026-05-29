import prisma from "@/utils/db";

type TimelineSort = "asc" | "desc";

type TimelineOptions = {
    page?: number;
    limit?: number;
    sort?: TimelineSort;
};

class TimelineService {
    async getTimeline(userId?: string, options: TimelineOptions = {}) {
        const whereClause = userId ? { source: { userId: userId } } : {};
        const page = Math.max(1, Math.floor(options.page || 1));
        const limit = Math.min(50, Math.max(1, Math.floor(options.limit || 10)));
        const sort: TimelineSort = options.sort === "desc" ? "desc" : "asc";

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where: whereClause,
                orderBy: {
                    deadline: sort,
                },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    source: true,
                },
            }),
            prisma.task.count({ where: whereClause }),
        ]);

        return {
            tasks: this.enrichWithConflicts(tasks),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
            sort,
        };
    }

    async deleteDeadline(taskId: string, userId?: string) {
        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                ...(userId ? { source: { userId } } : {}),
            },
        });

        if (!existingTask) {
            return null;
        }

        await prisma.notification.deleteMany({
            where: { taskId },
        });

        return prisma.task.delete({
            where: { id: taskId },
        });
    }

    private enrichWithConflicts(tasks: any[]) {
        return tasks.map((task, index) => {
            const conflicts = [];
            const taskDate = new Date(task.deadline).toDateString();
            const sameDayTasks = tasks.filter((t, i) => 
                i !== index && new Date(t.deadline).toDateString() === taskDate
            );

            if (sameDayTasks.length > 0) {
                conflicts.push(`High risk: ${sameDayTasks.length + 1} deadlines on this day.`);
            }

            return {
                ...task,
                conflicts,
                isHighRisk: conflicts.length > 0
            };
        });
    }
}

export const timelineService = new TimelineService();
