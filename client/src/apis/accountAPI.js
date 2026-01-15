import axiosClient from './axiosClient';

// Get all accounts by user
export const getAccountsByUser = (userId) => {
  return axiosClient.get(`/account/get-accounts/${userId}`);
};
// apis/accountAPI.js
export const getAccountsByWorkspace = (workspaceId) =>
  axiosClient.get(`/workspaces/${workspaceId}/accounts`);

export const deleteAccount = (accountId, workspaceId) =>
  axiosClient.delete(`/account/${accountId}`, {
    data: { workspaceId },
  });
// apis/groupAPI.js

