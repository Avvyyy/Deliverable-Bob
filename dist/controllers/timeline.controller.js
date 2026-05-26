import { timelineService } from "../services/timeline.service.js";
import { APIResponse } from "../response_handler/responses.js";
class TimelineController {
    async getTimeline(req, res) {
        try {
            const timeline = await timelineService.getTimeline(req.session.userId);
            return APIResponse.success(res, timeline, "Timeline retrieved successfully");
        }
        catch (error) {
            return APIResponse.error(res, error.message, "5001", 500);
        }
    }
}
export const timelineController = new TimelineController();
//# sourceMappingURL=timeline.controller.js.map