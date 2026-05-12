import { Request, Response } from "express";
import { timelineService } from "@/services/timeline.service";
import { APIResponse } from "@/response_handler/responses";

class TimelineController {
    async getTimeline(req: Request, res: Response) {
        try {
            const timeline = await timelineService.getTimeline();
            return APIResponse.success(res, timeline, "Timeline retrieved successfully");
        } catch (error: any) {
            return APIResponse.error(res, error.message, "5001", 500);
        }
    }
}

export const timelineController = new TimelineController();
