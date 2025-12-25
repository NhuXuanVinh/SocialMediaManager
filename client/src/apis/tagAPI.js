import axiosClient from './axiosClient';

/**
 * Create a new tag
 * POST /api/tags
 */
export const createTag = ({ name, description, color }) => {
  return axiosClient.post('/tags', {
    name,
    description,
    color,
  });
};

/**
 * Get tags
 * Supports search, pagination, usage count
 * GET /api/tags?search=&page=&limit=
 */
export const getTags = ({
  search = '',
  page = 1,
  limit = 20,
} = {}) => {
  return axiosClient.get('/tags', {
    params: { search, page, limit },
  });
};

/**
 * Update tag
 * PUT /api/tags/:id
 */
export const updateTag = (tagId, { name, description, color }) => {
  return axiosClient.put(`/tags/${tagId}`, {
    name,
    description,
    color,
  });
};

/**
 * Delete tag
 * DELETE /api/tags/:id
 */
export const deleteTag = (tagId) => {
  return axiosClient.delete(`/tags/${tagId}`);
};
