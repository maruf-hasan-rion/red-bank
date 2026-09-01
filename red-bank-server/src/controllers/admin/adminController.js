import User from '../../models/User.js';
import BloodDonation from '../../models/BloodDonation.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse.js';
import { escapeRegex, parsePagination } from '../../utils/pagination.js';
import { getTotalFundingAmountMinor } from '../../utils/fundStats.js';
import { DONATION_STATUS, ROLES, STATUS } from '../../utils/constants.js';

export const getDashboardOverview = catchAsync(async (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN) {
    return next(new AppError('Unauthorized', 403));
  }

  const totalDonors = await User.countDocuments({ role: ROLES.DONOR, status: STATUS.ACTIVE });
  const totalDonationRequests = await BloodDonation.countDocuments();

  const totalFundingAmountMinor = await getTotalFundingAmountMinor();

  sendSuccess(res, {
    totalDonors,
    totalDonationRequests,
    totalFundingAmount: totalFundingAmountMinor / 100,
    totalFundingAmountMinor,
  }, 200, 'Dashboard overview retrieved successfully');
});

export const getPaginatedUsers = catchAsync(async (req, res, next) => {
  const { page, limit } = parsePagination(req.query);
  const { status, search } = req.query;

  if (req.user.role !== ROLES.ADMIN) {
    return next(new AppError('Unauthorized', 403));
  }

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: escapeRegex(search.slice(0, 100)), $options: 'i' } },
      { email: { $regex: escapeRegex(search.slice(0, 100)), $options: 'i' } },
    ];
  }

  if (status && typeof status === 'string' && Object.values(STATUS).includes(status)) {
    query.status = status;
  } else if (status !== undefined) {
    throw new AppError('Invalid user status', 400);
  }

  const [users, totalItems] = await Promise.all([
    User.find(query)
      .select('email uid name avatar bloodGroup district upazila status role createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  sendPaginated(res, {
    collection: 'users',
    data: users,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    message: 'Users retrieved successfully',
  });
});

export const getPaginatedDonations = catchAsync(async (req, res, next) => {
  const { page, limit } = parsePagination(req.query);
  const { status } = req.query;

  if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.VOLUNTEER) {
    return next(new AppError('Unauthorized', 403));
  }

  const query = {};
  if (status && typeof status === 'string' && Object.values(DONATION_STATUS).includes(status)) {
    query.status = status;
  } else if (status !== undefined) {
    throw new AppError('Invalid donation status', 400);
  }

  const [donations, totalItems] = await Promise.all([
    BloodDonation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BloodDonation.countDocuments(query),
  ]);

  sendPaginated(res, {
    collection: 'donations',
    data: donations,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    message: 'Donations retrieved successfully',
  });
});
