import axiosClient from './axiosClient';

export const createTag = ({ workspaceId, name, description, color }) => {
  return axiosClient.post('/tags', {
    workspaceId,
    name,
    description,
    color,
  });
};

export const getTags = ({
  workspaceId,
  search = '',
  page = 1,
  limit = 20,
} = {}) => {
  return axiosClient.get('/tags', {
    params: {
      workspaceId,
      search,
      page,
      limit,
    },
  });
};


export const updateTag = (tagId, { workspaceId, name, description, color }) => {
  return axiosClient.put(`/tags/${tagId}`, {
    workspaceId,
    name,
    description,
    color,
  });
};

export const deleteTag = (tagId, workspaceId) => {
  return axiosClient.delete(`/tags/${tagId}`, {
    data: { workspaceId }, // 👈 REQUIRED
  });
};
