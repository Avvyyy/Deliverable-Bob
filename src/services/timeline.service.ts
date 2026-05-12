import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class TimelineService {
    async getTimeline() {
        const tasks = await prisma.task.findMany({
            orderBy: {
                deadline: 'asc'
            },
            include: {
                source: true
            }
        });

        return this.enrichWithConflicts(tasks);
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
