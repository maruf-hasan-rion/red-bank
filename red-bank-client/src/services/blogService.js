import api from './api';

const blogService = {
  create: (data) => api.post('/blog/create', data),
  getDetails: (postId, permalink) => {
    const params = postId ? { postId } : { permalink };
    return api.get('/blog/post/details', { params });
  },
  getManagementDetails: (id) =>
    api.get('/blog/management/details', { params: { id } }),
  getPublic: (search, limit) =>
    api.get('/blog/post/all', {
      params: { search: search || undefined, limit: limit || undefined },
    }),
  getPaginated: (page, limit, search, status) =>
    api.get('/blog/all/paginated', {
      params: {
        page,
        limit,
        search: search || undefined,
        ...(status && status !== 'all' && { status }),
      },
    }),
  update: (id, data) => api.patch('/blog/post/update', data, { params: { id } }),
  delete: (id) => api.delete('/blog/delete', { params: { id } }),
  verifyPermalink: (link, id) =>
    api.get('/blog/verify-permalink', { params: { link, id } }),
};

export default blogService;
