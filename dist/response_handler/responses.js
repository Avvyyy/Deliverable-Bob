class APIResponse {
    static success(res, data = null, message = "Success", statusCode = 200) {
        let response = {
            "success": true,
            "message": message,
        };
        if (data !== null) {
            response.data = data;
        }
        return res.status(statusCode).json(response);
    }
    static error(res, message = "Error", code = "5001", statusCode = 500) {
        return res.status(statusCode).json({
            "success": false,
            "errorCode": code,
            "message": message,
            "timestamp": new Date().toISOString(),
        });
    }
}
export { APIResponse };
//# sourceMappingURL=responses.js.map