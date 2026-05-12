class Pagination {
    total: number
    page: number
    limit: number
    pages: number
    hasNext: boolean
    hasPrevious: boolean

    constructor(
        total: number,
        page: number,
        limit: number,
        pages: number,
        hasNext: boolean,
        hasPrevious: boolean
    ) {
        this.total = total
        this.page = page
        this.limit = limit
        this.pages = pages
        this.hasNext = hasNext
        this.hasPrevious = hasPrevious
    }
}

export { Pagination }