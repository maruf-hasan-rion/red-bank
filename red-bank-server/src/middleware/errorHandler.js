const globalErrorHandler = (err, req, res, _next) => {
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.isOperational = true;
    err.message = 'Invalid resource identifier';
  }

  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.isOperational = true;
    err.message = 'Data validation failed';
  }

  if (err.code === 11000) {
    err.statusCode = 409;
    err.isOperational = true;
    err.message = 'A record with this value already exists';
    if (process.env.NODE_ENV === 'development') {
      console.error('Duplicate key:', JSON.stringify(err.keyValue || err.writeErrors?.[0]?.keyValue));
    }
  }

  if (err.type === 'entity.parse.failed') {
    err.statusCode = 400;
    err.isOperational = true;
    err.message = 'Invalid JSON payload';
  }

  if (err.type === 'entity.too.large') {
    err.statusCode = 413;
    err.isOperational = true;
    err.message = 'Request payload is too large';
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
        ...(err.details && { details: err.details }),
      });
    } else {
      console.error('ERROR:', err);
      res.status(500).json({
        success: false,
        status: 'error',
        message: 'Something went wrong',
      });
    }
  }
};

export default globalErrorHandler;
