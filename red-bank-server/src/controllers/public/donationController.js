import BloodDonation from '../../models/BloodDonation.js';
import catchAsync from '../../utils/catchAsync.js';
import { sendPaginated } from '../../utils/apiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { DONATION_STATUS } from '../../utils/constants.js';

export const getPublicDonations = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req.query);

  const query = { status: DONATION_STATUS.PENDING };

  const [donations, totalItems] = await Promise.all([
    BloodDonation.find(query)
      .select('-recipientEmail -authorEmail -donorEmail -authorAvatar')
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
    message: 'Donation requests retrieved successfully',
  });
});
