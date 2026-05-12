import { Request, Response } from "express";
import { ingestionQueue } from "@/queues/ingestion.queue";
import { APIResponse } from "@/response_handler/responses";

class IngestionController {
    async ingestText(req: Request, res: Response) {
        const { text } = req.body;
        
        if (!text) {
            return APIResponse.error(res, "Text is required", "4001", 400);
        }

        const job = await ingestionQueue.add("text-ingestion", {
            format: 'text',
            content: text,
        });

        return APIResponse.success(res, { jobId: job.id }, "Text extraction queued", 202);
    }

    async ingestPdf(req: Request, res: Response) {
        if (!req.file) {
            return APIResponse.error(res, "PDF file is required", "4001", 400);
        }

        const job = await ingestionQueue.add("pdf-ingestion", {
            format: 'pdf',
            content: req.file.buffer.toString('base64'),
            fileName: req.file.originalname,
        });

        return APIResponse.success(res, { jobId: job.id }, "PDF extraction queued", 202);
    }

    async getJobStatus(req: Request, res: Response) {
        const { jobId } = req.params;
        const job = await ingestionQueue.getJob(jobId!);

        if (!job) {
            return APIResponse.error(res, "Job not found", "4005", 404);
        }

        const state = await job.getState();
        const result = job.returnvalue;

        return APIResponse.success(res, {
            id: job.id,
            state,
            result: state === 'completed' ? result : null,
            reason: state === 'failed' ? job.failedReason : null
        }, "Job status retrieved");
    }
}

export const ingestionController = new IngestionController();
