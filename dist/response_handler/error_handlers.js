import { AppError } from "./exceptions.js";
/**
 * Gathers context about the current request for logging purposes.
 */
function get_request_context(req) {
    return {
        path: req.path,
        method: req.method,
        ip_address: req.ip || "unknown",
        user_id: req.user?.id || null,
    };
}
/**
 * Global Error Handling Middleware for Express
 */
export function globalErrorHandler(err, req, res, next) {
    const context = get_request_context(req);
    // 1. Handle our custom AppError
    if (err instanceof AppError) {
        const response = err.build();
        const statusCode = err.http_status_code();
        if (statusCode >= 500) {
            console.error(`[AppError] ${err.message}`, { ...context, error_code: err.error_code });
        }
        return res.status(statusCode).json(response);
    }
    // 2. Handle standard Validation/Value Errors (if any)
    if (err.name === "ValidationError" || err instanceof SyntaxError) {
        return res.status(400).json({
            success: false,
            statusCode: "4001",
            message: err.message || "Invalid request data",
            data: null
        });
    }
    // 3. Fallback for unexpected errors
    console.error(`[UnhandledError] ${err.message}`, { ...context, stack: err.stack });
    return res.status(500).json({
        success: false,
        statusCode: "5001",
        message: "An unexpected error occurred.",
        data: null
    });
}
//# sourceMappingURL=error_handlers.js.map