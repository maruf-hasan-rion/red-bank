import crypto from 'crypto';
import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';
import Blog from '../../models/Blog.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';
import { sendSuccess, sendPaginated } from '../../utils/apiResponse.js';
import { escapeRegex, parsePagination } from '../../utils/pagination.js';
import { BLOG_STATUS, ROLES } from '../../utils/constants.js';

const sanitizeBlogContent = (content = '') =>
  sanitizeHtml(content, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'a', 'img', 'code', 'pre', 'hr',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });

const publicBlogProjection = '-content';

const uniquePermalink = (base) =>
  `${base}-${crypto.randomBytes(4).toString('hex')}`;

const isDuplicateKeyError = (error) =>
  error?.code === 11000 ||
  error?.writeErrors?.some((e) => e?.code === 11000);

const duplicateKeyValue = (error) =>
  error?.keyValue || error?.writeErrors?.[0]?.keyValue || null;

const createBlogWithUniquePermalink = async (blogData) => {
  try {
    return await Blog.create(blogData);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Blog create duplicate key:', duplicateKeyValue(error));
      }
      if (duplicateKeyValue(error)?.permalink) {
        blogData.permalink = uniquePermalink(blogData.permalink);
        return await Blog.create(blogData);
      }
    }
    throw error;
  }
};

const updateBlogWithUniquePermalink = async (id, updateData) => {
  try {
    return await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    if (isDuplicateKeyError(error) && duplicateKeyValue(error)?.permalink) {
      updateData.permalink = uniquePermalink(updateData.permalink);
      return await Blog.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    }
    throw error;
  }
};

export const createBlog = catchAsync(async (req, res) => {
  const status =
    req.user.role === ROLES.ADMIN
      ? req.body.status || BLOG_STATUS.DRAFT
      : BLOG_STATUS.DRAFT;

  const blog = await createBlogWithUniquePermalink({
    ...req.body,
    status,
    content: sanitizeBlogContent(req.body.content),
  });

  sendSuccess(res, blog, 201, 'Blog created successfully');
});

export const getPostDetails = catchAsync(async (req, res) => {
  const { postId, permalink } = req.query;

  if (!postId && !permalink) {
    throw new AppError('Must provide either postId or permalink', 400);
  }

  if (postId && !mongoose.isValidObjectId(postId)) {
    throw new AppError('Valid blog ID is required', 400);
  }
  if (permalink && typeof permalink !== 'string') {
    throw new AppError('Valid permalink is required', 400);
  }

  const filter = postId
    ? { _id: postId, status: BLOG_STATUS.PUBLISHED }
    : { permalink, status: BLOG_STATUS.PUBLISHED };
  const post = await Blog.findOne(filter).lean();

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  sendSuccess(res, post, 200, 'Blog retrieved successfully');
});

export const getManagementPostDetails = catchAsync(async (req, res) => {
  if (!mongoose.isValidObjectId(req.query.id)) {
    throw new AppError('Valid blog ID is required', 400);
  }
  const post = await Blog.findById(req.query.id).lean();

  if (!post) {
    throw new AppError('Blog not found', 404);
  }

  sendSuccess(res, post, 200, 'Blog retrieved successfully');
});

export const updateBlog = catchAsync(async (req, res) => {
  if (!mongoose.isValidObjectId(req.query.id)) {
    throw new AppError('Valid blog ID is required', 400);
  }
  const updateData = { ...req.body };

  if (req.user.role !== ROLES.ADMIN && updateData.status !== undefined) {
    if (updateData.status !== BLOG_STATUS.DRAFT) {
      throw new AppError('Only admins can publish blog posts', 403);
    }
    delete updateData.status;
  }

  if (updateData.content !== undefined) {
    updateData.content = sanitizeBlogContent(updateData.content);
  }

  const blog = await updateBlogWithUniquePermalink(req.query.id, updateData);

  if (!blog) {
    throw new AppError('Blog not found', 404);
  }

  sendSuccess(res, blog, 200, 'Blog updated successfully');
});

export const getPaginatedBlogs = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  if (req.query.search !== undefined && typeof req.query.search !== 'string') {
    throw new AppError('Invalid blog search', 400);
  }
  const search = req.query.search?.trim().slice(0, 100);
  const status = req.query.status;
  if (
    status &&
    (typeof status !== 'string' || !Object.values(BLOG_STATUS).includes(status))
  ) {
    throw new AppError('Invalid blog status', 400);
  }
  const query = {};

  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { postTitle: { $regex: safeSearch, $options: 'i' } },
      { shortDescription: { $regex: safeSearch, $options: 'i' } },
      { permalink: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  if (status) query.status = status;

  const [blogs, totalItems] = await Promise.all([
    Blog.find(query)
      .select(publicBlogProjection)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    Blog.countDocuments(query),
  ]);

  sendPaginated(res, {
    collection: 'blogs',
    data: blogs,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    message: 'Blogs retrieved successfully',
  });
});

export const deleteBlog = catchAsync(async (req, res) => {
  const result = await Blog.deleteOne({ _id: req.query.id });

  if (result.deletedCount === 0) {
    throw new AppError('Post not found', 404);
  }

  sendSuccess(res, null, 200, 'Blog deleted successfully');
});

export const verifyPermalink = catchAsync(async (req, res) => {
  const link = req.query.link?.trim();

  if (!link || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(link)) {
    throw new AppError('A valid permalink is required', 400);
  }

  const filter = { permalink: link };
  if (req.query.id) {
    filter._id = { $ne: req.query.id };
  }

  const existingBlog = await Blog.findOne(filter).select('_id').lean();

  if (!existingBlog) {
    return sendSuccess(res, { permalink: link }, 200, 'Permalink is available');
  }

  const uniqueString = crypto.randomBytes(5).toString('hex');
  sendSuccess(
    res,
    { permalink: `${link}-${uniqueString}` },
    200,
    'Permalink modified to avoid conflict'
  );
});

export const getPublicBlogs = catchAsync(async (req, res) => {
  if (req.query.search !== undefined && typeof req.query.search !== 'string') {
    throw new AppError('Invalid blog search', 400);
  }
  const search = req.query.search?.trim().slice(0, 100);
  const searchQuery = search
    ? {
        $or: [
          { postTitle: { $regex: escapeRegex(search), $options: 'i' } },
          { shortDescription: { $regex: escapeRegex(search), $options: 'i' } },
        ],
      }
    : {};
  const limit = Math.min(Math.max(Number(req.query.limit) || 3, 1), 20);
  const query = { ...searchQuery, status: BLOG_STATUS.PUBLISHED };

  const [blogs, totalItems] = await Promise.all([
    Blog.find(query)
      .select(publicBlogProjection)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Blog.countDocuments(query),
  ]);

  sendSuccess(res, { blogs, blogsCount: totalItems }, 200, 'Blogs retrieved successfully');
});
