import User from '../../models/User.js';
import BloodDonation from '../../models/BloodDonation.js';
import catchAsync from '../../utils/catchAsync.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { getTotalFundingAmountMinor } from '../../utils/fundStats.js';
import { DONATION_STATUS, ROLES, STATUS } from '../../utils/constants.js';

export const getPublicStats = catchAsync(async (req, res) => {
  const [totalDonors, totalDonationRequests, totalDonationReqDone, totalFundingAmountMinor] =
    await Promise.all([
      User.countDocuments({ role: ROLES.DONOR, status: STATUS.ACTIVE }),
      BloodDonation.countDocuments(),
      BloodDonation.countDocuments({ status: DONATION_STATUS.DONE }),
      getTotalFundingAmountMinor(),
    ]);

  sendSuccess(
    res,
    {
      totalDonors,
      totalDonationRequests,
      totalDonationReqDone,
      totalFundingAmount: totalFundingAmountMinor / 100,
      totalFundingAmountMinor,
    },
    200,
    'Platform stats retrieved successfully'
  );
});