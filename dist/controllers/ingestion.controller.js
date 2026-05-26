import { ingestionQueue } from "../queues/ingestion.queue.js";
import { APIResponse } from "../response_handler/responses.js";
const wantsHtml = (req) => req.accepts(["html", "json"]) === "html";
class IngestionController {
    async ingestText(req, res) {
        const { text } = req.body;
        const userId = req.session.userId;
        if (!text) {
            return APIResponse.error(res, "Text is required", "4001", 400);
        }
        if (!userId) {
            return APIResponse.error(res, "Unauthorized", "401", 401);
        }
        const job = await ingestionQueue.add("text-ingestion", {
            format: 'text',
            content: text,
            userId: userId
        });
        if (wantsHtml(req)) {
            return res.redirect(`/dashboard?jobId=${job.id}`);
        }
        return APIResponse.success(res, { jobId: job.id }, "Text extraction queued", 202);
    }
    async ingestPdf(req, res) {
        if (!req.file) {
            return APIResponse.error(res, "PDF file is required", "4001", 400);
        }
        if (req.file.mimetype !== "application/pdf") {
            return APIResponse.error(res, "Only PDF files are supported on this endpoint", "4002", 400);
        }
        const userId = req.session.userId;
        if (!userId) {
            return APIResponse.error(res, "Unauthorized", "401", 401);
        }
        const job = await ingestionQueue.add("pdf-ingestion", {
            format: 'pdf',
            content: req.file.buffer.toString('base64'),
            fileName: req.file.originalname,
            userId: userId
        });
        if (wantsHtml(req)) {
            return res.redirect(`/dashboard?jobId=${job.id}`);
        }
        return APIResponse.success(res, { jobId: job.id }, "PDF extraction queued", 202);
    }
    async ingestImage(req, res) {
        if (!req.file) {
            return APIResponse.error(res, "Image file is required", "4001", 400);
        }
        if (!["image/png", "image/jpeg", "image/webp"].includes(req.file.mimetype)) {
            return APIResponse.error(res, "Only PNG, JPEG, and WEBP images are supported", "4002", 400);
        }
        const userId = req.session.userId;
        if (!userId) {
            return APIResponse.error(res, "Unauthorized", "401", 401);
        }
        const job = await ingestionQueue.add("image-ingestion", {
            format: 'image',
            content: req.file.buffer.toString('base64'),
            fileName: req.file.originalname,
            mimeType: req.file.mimetype,
            userId: userId
        });
        if (wantsHtml(req)) {
            return res.redirect(`/dashboard?jobId=${job.id}`);
        }
        return APIResponse.success(res, { jobId: job.id }, "Image extraction queued", 202);
    }
    async getJobStatus(req, res) {
        const { jobId } = req.params;
        if (!jobId || Array.isArray(jobId)) {
            return APIResponse.error(res, "Job ID is required", "4001", 400);
        }
        const job = await ingestionQueue.getJob(jobId);
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
//# sourceMappingURL=ingestion.controller.js.map