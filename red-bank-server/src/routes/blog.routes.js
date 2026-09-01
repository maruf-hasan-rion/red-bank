import express from 'express';
import {
  createBlog,
  getPostDetails,
  getManagementPostDetails,
  updateBlog,
  getPaginatedBlogs,
  deleteBlog,
  verifyPermalink,
  getPublicBlogs,
} from '../controllers/blog/blogController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createBlogSchema,
  updateBlogSchema,
} from '../validations/blog.validation.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.post('/create', authenticate, authorize(ROLES.ADMIN, ROLES.VOLUNTEER), validate(createBlogSchema), createBlog);
router.get('/post/details', getPostDetails);
router.get('/post/all', getPublicBlogs);
router.get('/management/details', authenticate, authorize(ROLES.ADMIN, ROLES.VOLUNTEER), getManagementPostDetails);
router.get('/all/paginated', authenticate, authorize(ROLES.ADMIN, ROLES.VOLUNTEER), getPaginatedBlogs);
router.patch('/post/update', authenticate, authorize(ROLES.ADMIN, ROLES.VOLUNTEER), validate(updateBlogSchema), updateBlog);
router.delete('/delete', authenticate, authorize(ROLES.ADMIN), deleteBlog);
router.get('/verify-permalink', verifyPermalink);

export default router;
