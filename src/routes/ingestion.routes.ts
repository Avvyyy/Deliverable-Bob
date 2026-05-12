import { Router } from "express";
import multer from "multer";
import { ingestionController } from "@/controllers/ingestion.controller";

const router = Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post("/text", ingestionController.ingestText);
router.post("/pdf", upload.single("file"), ingestionController.ingestPdf);
router.get("/status/:jobId", ingestionController.getJobStatus);

export default router;
