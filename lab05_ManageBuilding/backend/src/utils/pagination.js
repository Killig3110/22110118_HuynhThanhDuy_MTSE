/**
 * Calculate pagination parameters
 * @param {number} page - Current page number
 * @param {number} size - Items per page
 * @returns {Object} - Offset and limit for database queries
 */
const getPagination = (page, size) => {
    const limit = size ? parseInt(size) : 10;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    return { limit, offset };
};

/**
 * Format paginated data response
 * @param {Object} data - Database query result with count and rows
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} - Formatted data with pagination info
 */
const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows } = data;
    const currentPage = page ? parseInt(page) : 1;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNext = currentPage < totalPages;
    const hasPrev = currentPage > 1;

    return {
        data: rows,
        pagination: {
            totalItems,
            totalPages,
            currentPage,
            itemsPerPage: limit,
            hasNext,
            hasPrev,
            nextPage: hasNext ? currentPage + 1 : null,
            prevPage: hasPrev ? currentPage - 1 : null
        }
    };
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page limit
 * @returns {Object} - Validated parameters
 */
const validatePagination = (page = 1, limit = 10) => {
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(Math.max(1, parseInt(limit) || 10), 100); // Max 100 items per page

    return {
        page: validatedPage,
        limit: validatedLimit
    };
};

/**
 * Create pagination metadata only
 * @param {number} totalItems - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
const createPaginationMeta = (totalItems, page, limit) => {
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(totalItems / limit);
    const hasNext = currentPage < totalPages;
    const hasPrev = currentPage > 1;

    return {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage: parseInt(limit),
        hasNext,
        hasPrev,
        nextPage: hasNext ? currentPage + 1 : null,
        prevPage: hasPrev ? currentPage - 1 : null
    };
};

module.exports = {
    getPagination,
    getPagingData,
    validatePagination,
    createPaginationMeta
};