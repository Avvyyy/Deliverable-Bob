import { Enum } from "@/enum/enum.core";
export class ErrorCode extends Enum {
    // Client errors
    static readonly ERROR_4001 = "4001"; // Invalid input
    static readonly ERROR_4002 = "4002"; // Duplicate entry
    static readonly ERROR_4003 = "4003"; // Permission denied
    static readonly ERROR_4004 = "4004"; // Rate limit
    static readonly ERROR_4005 = "4005"; // Not found
    static readonly ERROR_4008 = "4008"; // Bad request
    static readonly ERROR_4009 = "4009"; // Unauthorized
    static readonly ERROR_4010 = "4010"; // Validation error
    static readonly ERROR_4011 = "4011"; // Invalid credentials
    static readonly ERROR_4015 = "4015"; // Already exists
    static readonly ERROR_4016 = "4016"; // User not found
    static readonly ERROR_4027 = "4027"; // Conflict
    static readonly ERROR_4028 = "4028"; // Duplicate resource
    static readonly ERROR_4029 = "4029"; // Invalid format
    static readonly ERROR_4030 = "4030"; // File too large
    
    // Server errors
    static readonly ERROR_5001 = "5001"; // Internal error
    static readonly ERROR_5002 = "5002"; // Operation failed
    static readonly ERROR_5003 = "5003"; // Data integrity error
}
