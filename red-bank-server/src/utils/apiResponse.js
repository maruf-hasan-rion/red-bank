export const sendSuccess = (res, data, statusCode = 200, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendPaginated = (
  res,
  { collection, data, totalItems, totalPages, currentPage, message = 'Success' }
) => {
  res.status(200).json({
    success: true,
    message,
    data: {
      [collection]: data,
      totalItems,
      totalPages,
      currentPage,
    },
  });
};