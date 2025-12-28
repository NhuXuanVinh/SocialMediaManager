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
