import mongoose from 'mongoose';
import { BLOG_STATUS } from '../utils/constants.js';

const blogSchema = new mongoose.Schema(
  {
    postTitle: {
      type: String,
      required: true,
    },
    permalink: {
      type: String,
      required: true,
      unique: true,
    },
    shortDescription: {
      type: String,
      maxlength: 400,
    },
    content: {
      type: String,
    },
    timeToRead: {
      type: Number,
    },
    status: {
      type: String,
      default: BLOG_STATUS.DRAFT,
      enum: Object.values(BLOG_STATUS),
    },
    thumbnail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ status: 1, createdAt: -1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
