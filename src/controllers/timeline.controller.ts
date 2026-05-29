import type { Request, Response } from "express";
import { timelineService } from "@/services/timeline.service";
import { APIResponse } from "@/response_handler/responses";

type TimelineSort = "asc" | "desc";

class TimelineController {
    private getTimelineOptions(req: Request) {
        const page = Number.parseInt(String(req.query.page || "1"), 10);
        const limit = Number.parseInt(String(req.query.limit || "10"), 10);
        const sort: TimelineSort = req.query.sort === "desc" ? "desc" : "asc";

        return {
            page: Number.isFinite(page) ? page : 1,
            limit: Number.isFinite(limit) ? limit : 10,
            sort,
        };
    }

    async getTimeline(req: Request, res: Response) {
        try {
            const timeline = await timelineService.getTimeline(req.session.userId, this.getTimelineOptions(req));
            return APIResponse.success(res, timeline, "Timeline retrieved successfully");
        } catch (error: any) {
            return APIResponse.error(res, error.message, "5001", 500);
        }
    }

    async deleteDeadline(req: Request, res: Response) {
        try {
            const taskId = req.params.id;
            if (!taskId || Array.isArray(taskId)) {
                return APIResponse.error(res, "Deadline ID is required", "4001", 400);
            }

            const deletedTask = await timelineService.deleteDeadline(taskId, req.session.userId);

            if (!deletedTask) {
                return APIResponse.error(res, "Deadline not found", "4004", 404);
            }

            if (req.accepts(["html", "json"]) === "html") {
                return res.redirect("/dashboard");
            }

            return APIResponse.success(res, { id: deletedTask.id }, "Deadline deleted successfully");
        } catch (error: any) {
            return APIResponse.error(res, error.message, "5001", 500);
        }
    }
}

export const timelineController = new TimelineController();
