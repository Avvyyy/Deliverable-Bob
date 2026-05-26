import type { Request, Response, NextFunction } from "express";
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => void;
declare class ViewController {
    renderDashboard(req: Request, res: Response): Promise<void>;
    renderIngestion(req: Request, res: Response): void;
    renderLogin(req: Request, res: Response): void;
    renderRegister(req: Request, res: Response): void;
}
export declare const viewController: ViewController;
export {};
//# sourceMappingURL=view.controller.d.ts.map