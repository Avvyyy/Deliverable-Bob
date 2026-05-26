class Pagination {
    total;
    page;
    limit;
    pages;
    hasNext;
    hasPrevious;
    constructor(total, page, limit, pages, hasNext, hasPrevious) {
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.pages = pages;
        this.hasNext = hasNext;
        this.hasPrevious = hasPrevious;
    }
}
export { Pagination };
//# sourceMappingURL=pagination.js.map