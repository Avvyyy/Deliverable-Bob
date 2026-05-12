import { ErrorCode } from "@/response_handler/error_codes";

export class AppError extends Error {
    static error_http_mapping: Record<string, number> = {
        "4001": 400, "4002": 400, "4003": 403, "4004": 429,
        "4005": 404, "4008": 400, "4009": 401, "4010": 400,
        "4011": 401, "4015": 400, "4016": 404, "4027": 409,
        "4028": 409, "4029": 400, "4030": 413, "5001": 500,
        "5002": 500, "5003": 500,
    };

    public error_code: string;
    public data: any;
    public default_message: string = "";

    constructor(
        error_code: string,
        data: any = null,
        message: string | null = null
    ) {
        super(message || "");
        this.error_code = error_code;
        this.data = data;
        // In TS, we need to set the prototype explicitly when extending Error
        Object.setPrototypeOf(this, AppError.prototype);
    }

    get_message(): string {
        const message = this.message || this.default_message;
        if (typeof this.data === "string") {
            return message.replace("{data}", this.data);
        }
        return message;
    }

    http_status_code(): number {
        return AppError.error_http_mapping[this.error_code] || 500;
    }

    build() {
        return {
            success: false,
            statusCode: this.error_code,
            message: this.get_message(),
            data: typeof this.data === "object" ? this.data : null,
        };
    }
}

// Specific exceptions
export class InvalidInputError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4001, data, message);
        this.default_message = "The {data} you entered is incorrect.";
        Object.setPrototypeOf(this, InvalidInputError.prototype);
    }
}

export class DuplicateEntryError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4002, data, message);
        this.default_message = "This information already exists. Use a different {data}.";
        Object.setPrototypeOf(this, DuplicateEntryError.prototype);
    }
}

export class PermissionDeniedError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4003, data, message);
        this.default_message = "You do not have permission for this action.";
        Object.setPrototypeOf(this, PermissionDeniedError.prototype);
    }
}

export class RateLimitError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4004, data, message);
        this.default_message = "Too many requests. Try again later.";
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

export class ResourceNotFoundError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4005, data, message);
        this.default_message = "The requested {data} was not found.";
        Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
    }
}

export class BadRequestError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4008, data, message);
        this.default_message = "Invalid request.";
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

export class UnauthorizedError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4009, data, message);
        this.default_message = "Authentication required.";
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4010, data, message);
        this.default_message = "Validation failed.";
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class InvalidCredentialsError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4011, data, message);
        this.default_message = "Invalid email or password.";
        Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
    }
}

export class EmailAlreadyExistsError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4015, data, message);
        this.default_message = "A user with this email already exists.";
        Object.setPrototypeOf(this, EmailAlreadyExistsError.prototype);
    }
}

export class UserNotFoundError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4016, data, message);
        this.default_message = "User not found.";
        Object.setPrototypeOf(this, UserNotFoundError.prototype);
    }
}

export class ConflictError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4027, data, message);
        this.default_message = "Request conflicts with resource state.";
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export class DuplicateResourceError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4028, data, message);
        this.default_message = "This resource already exists.";
        Object.setPrototypeOf(this, DuplicateResourceError.prototype);
    }
}

export class InvalidFormatError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4029, data, message);
        this.default_message = "Invalid data format.";
        Object.setPrototypeOf(this, InvalidFormatError.prototype);
    }
}

export class FileTooLargeError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_4030, data, message);
        this.default_message = "File is too large.";
        Object.setPrototypeOf(this, FileTooLargeError.prototype);
    }
}

export class InternalServerError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_5001, data, message);
        this.default_message = "An unexpected error occurred.";
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}

export class OperationFailedError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_5002, data, message);
        this.default_message = "Operation failed.";
        Object.setPrototypeOf(this, OperationFailedError.prototype);
    }
}

export class DataIntegrityError extends AppError {
    constructor(data: any = null, message: string | null = null) {
        super(ErrorCode.ERROR_5003, data, message);
        this.default_message = "Data integrity violation.";
        Object.setPrototypeOf(this, DataIntegrityError.prototype);
    }
}