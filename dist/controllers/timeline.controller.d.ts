import type { Request, Response } from "express";
declare class TimelineController {
    getTimeline(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const timelineController: TimelineController;
export {};
//# sourceMappingURL=timeline.controller.d.ts.map