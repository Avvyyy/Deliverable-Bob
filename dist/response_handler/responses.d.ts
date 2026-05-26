import type { Response } from "express";
declare class APIResponse {
    static success(res: Response, data?: any, message?: string, statusCode?: number): Response;
    static error(res: Response, message?: string, code?: string, statusCode?: number): Response;
}
export { APIResponse };
//# sourceMappingURL=responses.d.ts.map