import type { Request, Response, NextFunction } from "express";
import { timelineService } from "@/services/timeline.service";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
};

class ViewController {
    private readErrorMessage(rawError: unknown): string | null {
        if (typeof rawError !== "string" || rawError.trim().length === 0) {
            return null;
        }

        return rawError.slice(0, 200);
    }

    renderDashboard = async (req: Request, res: Response) => {
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
        } catch (error) {
            res.render("dashboard", { error: "Failed to load timeline" });
        }
    };

    renderIngestion = (req: Request, res: Response) => {
        res.render("ingestion", { user: { id: req.session.userId } });
    };

    renderLogin = (req: Request, res: Response) => {
        if (req.session.userId) {
            return res.redirect("/dashboard");
        }
        const error = this.readErrorMessage(req.query.error);
        res.render("login", { error });
    };

    renderRegister = (req: Request, res: Response) => {
        if (req.session.userId) {
            return res.redirect("/dashboard");
        }
        const error = this.readErrorMessage(req.query.error);
        res.render("register", { error });
    };
}

export const viewController = new ViewController();
