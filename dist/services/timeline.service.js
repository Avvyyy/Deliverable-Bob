import prisma from "../utils/db.js";
class TimelineService {
    async getTimeline(userId) {
        const whereClause = userId ? { source: { userId: userId } } : {};
        const tasks = await prisma.task.findMany({
            where: whereClause,
            orderBy: {
                deadline: 'asc'
            },
            include: {
                source: true
            }
        });
        return this.enrichWithConflicts(tasks);
    }
    enrichWithConflicts(tasks) {
        return tasks.map((task, index) => {
            const conflicts = [];
            const taskDate = new Date(task.deadline).toDateString();
            const sameDayTasks = tasks.filter((t, i) => i !== index && new Date(t.deadline).toDateString() === taskDate);
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
//# sourceMappingURL=timeline.service.js.map