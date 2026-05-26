import { Router } from "express";
import { viewController, requireAuth } from "../controllers/view.controller.js";
const router = Router();
router.get("/", viewController.renderLogin);
router.get("/login", viewController.renderLogin);
router.get("/register", viewController.renderRegister);
router.get("/dashboard", requireAuth, viewController.renderDashboard);
router.get("/ingestion", requireAuth, viewController.renderIngestion);
export default router;
//# sourceMappingURL=view.routes.js.map