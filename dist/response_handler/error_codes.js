import { Enum } from "../enum/enum.core.js";
export class ErrorCode extends Enum {
    // Client errors
    static ERROR_4001 = "4001"; // Invalid input
    static ERROR_4002 = "4002"; // Duplicate entry
    static ERROR_4003 = "4003"; // Permission denied
    static ERROR_4004 = "4004"; // Rate limit
    static ERROR_4005 = "4005"; // Not found
    static ERROR_4008 = "4008"; // Bad request
    static ERROR_4009 = "4009"; // Unauthorized
    static ERROR_4010 = "4010"; // Validation error
    static ERROR_4011 = "4011"; // Invalid credentials
    static ERROR_4015 = "4015"; // Already exists
    static ERROR_4016 = "4016"; // User not found
    static ERROR_4027 = "4027"; // Conflict
    static ERROR_4028 = "4028"; // Duplicate resource
    static ERROR_4029 = "4029"; // Invalid format
    static ERROR_4030 = "4030"; // File too large
    // Server errors
    static ERROR_5001 = "5001"; // Internal error
    static ERROR_5002 = "5002"; // Operation failed
    static ERROR_5003 = "5003"; // Data integrity error
}
//# sourceMappingURL=error_codes.js.map