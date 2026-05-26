import { timelineService } from "../services/timeline.service.js";
export const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
};
class ViewController {
    async renderDashboard(req, res) {
        try {
            const userId = req.session.userId;
            const timeline = await timelineService.getTimeline(userId);
            // Format dates for the view
            const formattedTasks = timeline.map(task => ({
                ...task,
                deadlineStr: new Date(task.deadline).toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })
            }));
            res.render("dashboard", {
                user: { id: userId },
                queuedJobId: req.query.jobId,
                tasks: formattedTasks
            });
        }
        catch (error) {
            res.render("dashboard", { error: "Failed to load timeline" });
        }
    }
    renderIngestion(req, res) {
        res.render("ingestion", { user: { id: req.session.userId } });
    }
    renderLogin(req, res) {
        if (req.session.userId) {
            return res.redirect("/dashboard");
        }
        res.render("login");
    }
    renderRegister(req, res) {
        if (req.session.userId) {
            return res.redirect("/dashboard");
        }
        res.render("register");
    }
}
export const viewController = new ViewController();
//# sourceMappingURL=view.controller.js.map