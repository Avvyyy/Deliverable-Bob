import { Router } from "express";
import { timelineController } from "@/controllers/timeline.controller";

const router = Router();

router.get("/", timelineController.getTimeline);
router.delete("/:id", timelineController.deleteDeadline);
router.post("/:id/delete", timelineController.deleteDeadline);

export default router;
