import { Router } from "express";
import { timelineController } from "../controllers/timeline.controller.js";
const router = Router();
router.get("/", timelineController.getTimeline);
export default router;
//# sourceMappingURL=timeline.routes.js.map