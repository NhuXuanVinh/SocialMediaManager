import axiosClient from './axiosClient';

/**
 * Create a new post (post / draft / schedule)
 * Uses multipart/form-data
 */
export const createPost = (formData) => {
  return axiosClient.post('/post', formData, {
    headers: {
      // ❗ override JSON header
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const transitionPost = async (postId, workspaceId) => {
  const res = await axiosClient.patch(
    `/posts/${postId}/action`,
    {
      workspaceId, // 👈 REQUIRED by middleware
    }
  );
  return res.data;
};

export const deletePost = (postId, workspaceId) =>
  axiosClient.delete(`/post/${postId}`, {
    data: { workspaceId },
  });

  export const updatePostTags = (postId, workspaceId, tagIds = []) => {
  return axiosClient.put(`/post/${postId}`, {
    workspaceId,
    tagIds,
  });
};
