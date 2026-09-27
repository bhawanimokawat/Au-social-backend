const notFoundMiddleware = (req, res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);

    error.statusCode = 404;

    next(error);
};

const errorMiddleware = (err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);

    // JSON body too large
    if (err.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            message: "Request body is too large",
        });
    }

    // Invalid JSON
    if (err instanceof SyntaxError && err.status === 400 && err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format",
        });
    }

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? "Internal server error"
                : err.message,
    });
};

module.exports = {
    notFoundMiddleware,
    errorMiddleware,
};