export declare class AppError extends Error {
    static error_http_mapping: Record<string, number>;
    error_code: string;
    data: any;
    default_message: string;
    constructor(error_code: string, data?: any, message?: string | null);
    get_message(): string;
    http_status_code(): number;
    build(): {
        success: boolean;
        statusCode: string;
        message: string;
        data: any;
    };
}
export declare class InvalidInputError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class DuplicateEntryError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class PermissionDeniedError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class RateLimitError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class ResourceNotFoundError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class BadRequestError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class UnauthorizedError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class ValidationError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class InvalidCredentialsError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class EmailAlreadyExistsError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class UserNotFoundError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class ConflictError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class DuplicateResourceError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class InvalidFormatError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class FileTooLargeError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class InternalServerError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class OperationFailedError extends AppError {
    constructor(data?: any, message?: string | null);
}
export declare class DataIntegrityError extends AppError {
    constructor(data?: any, message?: string | null);
}
//# sourceMappingURL=exceptions.d.ts.map