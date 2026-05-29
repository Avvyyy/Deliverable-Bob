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
            const page = Number.parseInt(String(req.query.page || "1"), 10);
            const sort = req.query.sort === "desc" ? "desc" : "asc";
            const timeline = await timelineService.getTimeline(userId, {
                page: Number.isFinite(page) ? page : 1,
                limit: 10,
                sort,
            });
            
            // Format dates for the view
            const formattedTasks = timeline.tasks.map(task => ({
                ...task,
                deadlineStr: new Date(task.deadline).toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })
            }));
            const pagination = {
                ...timeline.pagination,
                previousPage: Math.max(1, timeline.pagination.page - 1),
                nextPage: Math.min(timeline.pagination.totalPages, timeline.pagination.page + 1),
            };

            res.render("dashboard", { 
                user: { id: userId },
                queuedJobId: req.query.jobId,
                tasks: formattedTasks,
                sort: timeline.sort,
                isAscending: timeline.sort === "asc",
                isDescending: timeline.sort === "desc",
                pagination,
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
