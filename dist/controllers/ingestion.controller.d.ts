import type { Request, Response } from "express";
declare class IngestionController {
    ingestText(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    ingestPdf(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    ingestImage(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    getJobStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const ingestionController: IngestionController;
export {};
//# sourceMappingURL=ingestion.controller.d.ts.map