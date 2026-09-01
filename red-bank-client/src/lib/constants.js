export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_GROUP_OPTIONS = [
  { type: 'A+', color: '#D50032' },
  { type: 'A-', color: '#9E0000' },
  { type: 'B+', color: '#B21800' },
  { type: 'B-', color: '#8B0000' },
  { type: 'AB+', color: '#F30D30' },
  { type: 'AB-', color: '#9C1D1D' },
  { type: 'O+', color: '#FF1C00' },
  { type: 'O-', color: '#700000' },
];

export const DONATION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  CANCELED: 'canceled',
};

export const USER_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
};

export const USER_ROLES = {
  DONOR: 'donor',
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin',
};

export const BLOG_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};

export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const DEBOUNCE_DELAY = 400;

export const AVATAR_COMPRESSION = {
  maxSizeMB: 0.2,
  maxWidthOrHeight: 100,
  useWebWorker: true,
};

export const THUMBNAIL_COMPRESSION = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1000,
  useWebWorker: true,
};

export const DONATION_AMOUNT_LIMITS = {
  MIN: 50,
  MAX: 1000000,
};

export const TABLE_PAGE_SIZES = [5, 10, 20, 50];

export const DONATION_FILTERS = [
  { value: 'all', label: 'All', className: 'bg-green-400 hover:bg-green-500' },
  {
    value: DONATION_STATUS.PENDING,
    label: 'Pending',
    className: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    value: DONATION_STATUS.IN_PROGRESS,
    label: 'InProgress',
    className: 'bg-yellow-400 hover:bg-yellow-500',
  },
  {
    value: DONATION_STATUS.DONE,
    label: 'Done',
    className: 'bg-sky-500 hover:bg-sky-700',
  },
  {
    value: DONATION_STATUS.CANCELED,
    label: 'Canceled',
    className: 'bg-red-500 hover:bg-red-700',
  },
];
