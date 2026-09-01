import Fund from '../models/Fund.js';

export const getTotalFundingAmountMinor = async () => {
  const [result] = await Fund.aggregate([
    {
      $group: {
        _id: null,
        totalAmountMinor: {
          $sum: {
            $ifNull: ['$amountMinor', { $multiply: ['$amount', 100] }],
          },
        },
      },
    },
  ]);

  return result?.totalAmountMinor || 0;
};