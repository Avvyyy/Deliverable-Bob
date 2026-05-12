import { Router } from "express";
import { timelineController } from "@/controllers/timeline.controller";

const router = Router();

router.get("/", timelineController.getTimeline);

export default router;
