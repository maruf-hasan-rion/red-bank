import mongoose from 'mongoose';
import BloodDonation from '../../models/BloodDonation.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse.js';
import { parsePagination } from '../../utils/pagination.js';
import { DONATION_STATUS, ROLES } from '../../utils/constants.js';

const OWNER_FIELDS = [
  'donationDate',
  'donationMsg',
  'donationTime',
  'fullAddress',
  'hospitalName',
  'recipientEmail',
  'recipientName',
  'recipientDistrict',
  'recipientUpazila',
  'bloodGroup',
];

const isStaff = (user) =>
  [ROLES.ADMIN, ROLES.VOLUNTEER].includes(user?.role);

const pick = (source, keys) =>
  Object.fromEntries(
    keys
      .filter((key) => source[key] !== undefined)
      .map((key) => [key, source[key]])
  );

const ensureObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Valid donation ID is required', 400);
  }
};

const allowedTransition = (currentStatus, nextStatus) => {
  const transitions = {
    [DONATION_STATUS.PENDING]: [DONATION_STATUS.CANCELED],
    [DONATION_STATUS.IN_PROGRESS]: [DONATION_STATUS.DONE, DONATION_STATUS.CANCELED],
  };

  return transitions[currentStatus]?.includes(nextStatus);
};

export const createDonation = catchAsync(async (req, res) => {
  const donation = await BloodDonation.create({
    ...req.body,
    authorEmail: req.user.email,
    authorName: req.user.name,
    authorAvatar: req.user.avatar,
  });

  sendSuccess(res, donation, 201, 'Donation request created successfully');
});

export const getDonationsForDonor = catchAsync(async (req, res) => {
  const { limit } = req.query;
  const parsedLimit = limit === undefined ? 50 : Number(limit);

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
    throw new AppError('Limit must be between 1 and 50', 400);
  }

  const email = isStaff(req.user) && req.query.email
    ? req.query.email
    : req.user.email;

  if (typeof email !== 'string') {
    throw new AppError('Invalid email filter', 400);
  }

  const donations = await BloodDonation.find({ authorEmail: email })
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .lean();

  sendSuccess(res, donations, 200, 'Donations retrieved successfully');
});

export const getDonationDetails = catchAsync(async (req, res) => {
  ensureObjectId(req.query.id);

  const donation = await BloodDonation.findById(req.query.id).lean();

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  if (
    !isStaff(req.user) &&
    donation.authorEmail !== req.user.email &&
    donation.donorEmail !== req.user.email
  ) {
    throw new AppError('Unauthorized', 403);
  }

  sendSuccess(res, donation, 200, 'Donation details retrieved successfully');
});

export const deleteDonation = catchAsync(async (req, res) => {
  ensureObjectId(req.query.id);

  const donation = await BloodDonation.findById(req.query.id).lean();

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  if (req.user.role !== ROLES.ADMIN && donation.authorEmail !== req.user.email) {
    throw new AppError('Unauthorized', 403);
  }

  await BloodDonation.deleteOne({ _id: req.query.id });
  sendSuccess(res, null, 200, 'Donation deleted successfully');
});

export const updateDonation = catchAsync(async (req, res) => {
  ensureObjectId(req.query.id);

  const donation = await BloodDonation.findById(req.query.id).lean();

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  const staff = isStaff(req.user);
  const owner = donation.authorEmail === req.user.email;

  if (!staff && !owner) {
    throw new AppError('Unauthorized', 403);
  }

  if (req.body.status) {
    if (!owner && !staff) {
      throw new AppError('Unauthorized', 403);
    }
    if (!allowedTransition(donation.status, req.body.status)) {
      throw new AppError('Invalid donation status transition', 409);
    }

    const updated = await BloodDonation.findOneAndUpdate(
      { _id: req.query.id, status: donation.status },
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new AppError('Donation was updated by another request', 409);
    }

    return sendSuccess(res, updated, 200, 'Donation status updated successfully');
  }

  if (!owner) {
    throw new AppError('Only the request owner can edit donation details', 403);
  }

  if (donation.status !== DONATION_STATUS.PENDING) {
    throw new AppError('Only pending donation requests can be edited', 409);
  }

  const updates = pick(req.body, OWNER_FIELDS);
  if (Object.keys(updates).length === 0) {
    throw new AppError('At least one donation field is required', 400);
  }

  const updated = await BloodDonation.findOneAndUpdate(
    { _id: req.query.id, authorEmail: req.user.email, status: DONATION_STATUS.PENDING },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new AppError('Donation cannot be edited in its current state', 409);
  }

  return sendSuccess(res, updated, 200, 'Donation updated successfully');
});

export const claimDonation = catchAsync(async (req, res) => {
  ensureObjectId(req.body.id);

  if (req.user.role !== ROLES.DONOR) {
    throw new AppError('Only donor accounts can claim donation requests', 403);
  }

  const donation = await BloodDonation.findOneAndUpdate(
    {
      _id: req.body.id,
      status: DONATION_STATUS.PENDING,
      donorEmail: { $exists: false },
    },
    {
      $set: {
        donorEmail: req.user.email,
        donorName: req.user.name,
        status: DONATION_STATUS.IN_PROGRESS,
      },
    },
    { new: true, runValidators: true }
  );

  if (!donation) {
    throw new AppError('This donation request is no longer available', 409);
  }

  sendSuccess(res, donation, 200, 'Donation request claimed successfully');
});

export const getPaginatedDonations = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const staff = isStaff(req.user);
  const requestedEmail = req.query.email;
  const requestedDonorEmail = req.query.donorEmail;
  const status = req.query.status;

  if (
    (requestedEmail !== undefined && typeof requestedEmail !== 'string') ||
    (requestedDonorEmail !== undefined && typeof requestedDonorEmail !== 'string')
  ) {
    throw new AppError('Invalid donation filter', 400);
  }

  if (status && !Object.values(DONATION_STATUS).includes(status)) {
    throw new AppError('Invalid donation status', 400);
  }

  const ownershipQuery = staff
    ? requestedEmail
      ? { authorEmail: requestedEmail }
      : requestedDonorEmail
        ? { donorEmail: requestedDonorEmail }
        : {}
    : requestedDonorEmail
      ? { donorEmail: req.user.email }
      : { authorEmail: req.user.email };
  const query = status ? { ...ownershipQuery, status } : ownershipQuery;

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

export const getSingleDonation = catchAsync(async (req, res) => {
  ensureObjectId(req.query.postId);

  const donation = await BloodDonation.findById(req.query.postId).lean();

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  const canSeePrivateFields =
    isStaff(req.user) ||
    donation.authorEmail === req.user.email ||
    donation.donorEmail === req.user.email;

  if (!canSeePrivateFields && donation.status !== 'pending') {
    throw new AppError('Unauthorized', 403);
  }

  if (canSeePrivateFields) {
    return sendSuccess(res, donation, 200, 'Donation retrieved successfully');
  }

  const publicDonation = { ...donation };
  delete publicDonation.authorEmail;
  delete publicDonation.authorAvatar;
  delete publicDonation.donorEmail;
  delete publicDonation.donorName;
  delete publicDonation.recipientEmail;

  sendSuccess(res, publicDonation, 200, 'Donation retrieved successfully');
});
