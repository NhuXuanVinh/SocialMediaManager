import axiosClient from './axiosClient';

const API_URL = 'http://localhost:5000/api/groups';  // Change this to your backend URL if different

// Create a new group
export const createGroup = (userId, name) => {
  return axiosClient.post(`${API_URL}/create`, { userId, name });
};

// Add an account to a group
export const addAccountToGroup = (groupId, accountId) => {
  return axiosClient.post(`${API_URL}/add-account`, { groupId, accountId });
};

// Remove an account from a group
export const removeAccountFromGroup = (groupId, accountId) => {
  return axiosClient.post(`${API_URL}/remove-account`, { groupId, accountId });
};

// Get a group with its associated accounts
export const getGroupsByUser = (userId) => {
  return axiosClient.get(`${API_URL}/${userId}`);
};

export const getGroupById = (groupId) => {
  return axiosClient.get(`${API_URL}/find/${groupId}`);
};