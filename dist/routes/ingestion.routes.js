import { Router } from "express";
import multer from "multer";
import { ingestionController } from "../controllers/ingestion.controller.js";
const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req, file, cb) => {
        const allowedTypes = new Set([
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/webp",
        ]);
        if (allowedTypes.has(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new Error("Only PDF, PNG, JPEG, and WEBP files are supported."));
    },
});
router.post("/text", ingestionController.ingestText);
router.post("/pdf", upload.single("file"), ingestionController.ingestPdf);
router.post("/image", upload.single("file"), ingestionController.ingestImage);
router.get("/status/:jobId", ingestionController.getJobStatus);
export default router;
//# sourceMappingURL=ingestion.routes.js.map