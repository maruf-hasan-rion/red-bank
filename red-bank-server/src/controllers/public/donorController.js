import User from '../../models/User.js';
import catchAsync from '../../utils/catchAsync.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { escapeRegex } from '../../utils/pagination.js';
import { ROLES, STATUS } from '../../utils/constants.js';

export const getAllDonors = catchAsync(async (req, res) => {
  const { district, upazila, blood } = req.body;

  let query = { role: ROLES.DONOR, status: STATUS.ACTIVE };
  const andConditions = [];

  if (district) {
    andConditions.push({ district: { $regex: escapeRegex(district), $options: 'i' } });
  }
  if (upazila) {
    andConditions.push({ upazila: { $regex: escapeRegex(upazila), $options: 'i' } });
  }
  if (blood) {
    andConditions.push({ bloodGroup: blood.toUpperCase() });
  }

  if (andConditions.length > 0) {
    query = { ...query, $and: andConditions };
  }

  const donors = await User.find(query)
    .select('name email avatar bloodGroup district upazila createdAt')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const totalItems = await User.countDocuments(query);

  sendSuccess(res, { donors, totalItems }, 200, 'Donors retrieved successfully');
});
