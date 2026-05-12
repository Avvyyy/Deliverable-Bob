import { PrismaClient } from "@prisma/client";
import type { ExtractedTask } from "@/schema/task.schema";
const prisma = new PrismaClient();

async function checkDeduplication(title: string, deadline: Date) {
    const existingTask = await prisma.task.findFirst({
        where: {
            title: title,
            deadline: deadline
        }
    });
    return existingTask;
}


async function saveExtraction(
    sourceInfo: { type: string; name?: string | undefined; rawContent: string },
    extractedTask: ExtractedTask
) {
    const deadline = new Date(extractedTask.dueDate);

    const existing = await checkDeduplication(extractedTask.task, deadline);
    if (existing && existing.confidenceScore > extractedTask.confidenceScore) {
        return await prisma.task.update({
            where: {
                id: existing.id
            },
            data: {
                confidenceScore: extractedTask.confidenceScore,
                description: extractedTask.description,
                originalDeadlineText: extractedTask.originalDeadlineText,
                priority: extractedTask.priority,
                task: extractedTask.task,
                dueDate: deadline
            }
        })
    } else {
        return await prisma.source.create({
            data: {
                type: sourceInfo.type,
                name: sourceInfo.name || "Unnamed Source",
                rawContent: sourceInfo.rawContent,
                tasks: {
                    create: {
                        title: extractedTask.task,
                        deadline: deadline,
                        originalDeadlineText: extractedTask.originalDeadlineText,
                        confidenceScore: extractedTask.confidenceScore,
                        status: "PENDING"
                    }
                }
            },
            include: {
                tasks: true
            }
        });
    }
}

export { checkDeduplication, saveExtraction };