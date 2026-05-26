import type { Request, Response } from "express";
declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}
export declare class AuthController {
    register(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    login(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    logout(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map