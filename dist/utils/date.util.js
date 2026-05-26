import * as chrono from 'chrono-node';
export function normalizeDate(dateString) {
    if (!dateString)
        return null;
    // Parse the date string using chrono-node
    const parsedDate = chrono.parseDate(dateString);
    if (parsedDate) {
        return parsedDate;
    }
    // Fallback: try standard Date constructor if chrono fails
    const fallbackDate = new Date(dateString);
    if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate;
    }
    return null;
}
//# sourceMappingURL=date.util.js.map