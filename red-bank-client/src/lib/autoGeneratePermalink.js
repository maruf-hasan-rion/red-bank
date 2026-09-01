import blogService from '@/services/blogService';

const generatePermalink = async (input) => {
  const permalink = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  const { data } = await blogService.verifyPermalink(permalink);
  return data?.permalink;
};

export default generatePermalink;
