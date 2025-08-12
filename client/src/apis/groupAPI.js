import axios from 'axios';

const API_URL = 'http://localhost:5000/api/groups';  // Change this to your backend URL if different

// Create a new group
export const createGroup = (userId, name) => {
  return axios.post(`${API_URL}/create`, { userId, name });
};

// Add an account to a group
export const addAccountToGroup = (groupId, accountId) => {
  return axios.post(`${API_URL}/add-account`, { groupId, accountId });
};

// Remove an account from a group
export const removeAccountFromGroup = (groupId, accountId) => {
  return axios.post(`${API_URL}/remove-account`, { groupId, accountId });
};

// Get a group with its associated accounts
export const getGroupsByUser = (userId) => {
  return axios.get(`${API_URL}/${userId}`);
};

export const getGroupById = (groupId) => {
  return axios.get(`${API_URL}/find/${groupId}`);
};