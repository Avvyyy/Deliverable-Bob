import { normalizeDate } from "../utils/date.util.js";
import prisma from "../utils/db.js";
async function checkDeduplication(title, deadline, userId) {
    const existingTask = await prisma.task.findFirst({
        where: {
            title: title,
            deadline: deadline,
            source: {
                userId: userId
            }
        }
    });
    return existingTask;
}
async function upsertExtractedTask(sourceId, userId, extractedTask) {
    const deadline = normalizeDate(extractedTask.dueDate) || new Date(extractedTask.dueDate);
    if (isNaN(deadline.getTime())) {
        throw new Error("No valid deadline date was extracted.");
    }
    const existing = await checkDeduplication(extractedTask.task, deadline, userId);
    if (existing) {
        // If it exists and the new extraction has higher confidence, we can update it
        if (extractedTask.confidenceScore > existing.confidenceScore) {
            return await prisma.task.update({
                where: {
                    id: existing.id
                },
                data: {
                    confidenceScore: extractedTask.confidenceScore,
                    originalDeadlineText: extractedTask.originalDeadlineText,
                    title: extractedTask.task,
                    deadline: deadline
                }
            });
        }
        return existing;
    }
    return await prisma.task.create({
        data: {
            sourceId,
            title: extractedTask.task,
            deadline,
            originalDeadlineText: extractedTask.originalDeadlineText,
            confidenceScore: extractedTask.confidenceScore,
            status: "PENDING"
        }
    });
}
async function saveExtraction(sourceInfo, extractedTasks) {
    const source = await prisma.source.create({
        data: {
            type: sourceInfo.type,
            name: sourceInfo.name || "Unnamed Source",
            rawContent: sourceInfo.rawContent,
            userId: sourceInfo.userId,
        },
    });
    const tasks = [];
    for (const extractedTask of extractedTasks) {
        tasks.push(await upsertExtractedTask(source.id, sourceInfo.userId, extractedTask));
    }
    return {
        ...source,
        tasks,
    };
}
export { checkDeduplication, saveExtraction };
//# sourceMappingURL=task.service.js.map