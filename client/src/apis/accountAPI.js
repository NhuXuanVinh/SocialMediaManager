import axiosClient from './axiosClient';

// Get all accounts by user
export const getAccountsByUser = (userId) => {
  return axiosClient.get(`/account/get-accounts/${userId}`);
};
