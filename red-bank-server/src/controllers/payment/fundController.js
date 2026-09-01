import Fund from '../../models/Fund.js';
import catchAsync from '../../utils/catchAsync.js';
import { sendPaginated } from '../../utils/apiResponse.js';
import { parsePagination } from '../../utils/pagination.js';

export const getAllFunds = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req.query);

  const [funds, totalItems] = await Promise.all([
    Fund.find()
      .select('name avatar note amountMinor amount currency status createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Fund.countDocuments(),
  ]);

  sendPaginated(res, {
    collection: 'funds',
    data: funds,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    message: 'Funds retrieved successfully',
  });
});
