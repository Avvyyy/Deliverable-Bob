import type { Response } from "express";

class APIResponse {
    static success(
        res: Response,
        data: any = null,
        message: string = "Success",
        statusCode: number = 200,
    ): Response {
        let response: any = {
            "success": true,
            "message": message,
        }
        if (data !== null) {
            response.data = data
        }
        return res.status(statusCode).json(response)
    }
    static error(
        res: Response,
        message: string = "Error",
        code: string = "5001",
        statusCode: number = 500,
    ): Response {
        return res.status(statusCode).json({
            "success": false,
            "errorCode": code,
            "message": message,
            "timestamp": new Date().toISOString(),
        })
    }
}

export { APIResponse }