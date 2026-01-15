import axiosClient from './axiosClient';

const API_URL = 'http://localhost:5000/api/groups';  // Change this to your backend URL if different


// Get a group with its associated accounts
export const getGroupsByUser = (userId) => {
  return axiosClient.get(`${API_URL}/${userId}`);
};

export const getGroupById = (groupId) => {
  return axiosClient.get(`${API_URL}/find/${groupId}`);
};

export const createGroup = (workspaceId, payload) =>
  axiosClient.post(`/workspaces/${workspaceId}/groups`, payload);

export const addAccountToGroup = (groupId, accountId, workspaceId) =>
  axiosClient.post(`/groups/${groupId}/accounts/${accountId}`, { workspaceId });

export const removeAccountFromGroup = (groupId, accountId, workspaceId) =>
  axiosClient.delete(`/groups/${groupId}/accounts/${accountId}`, { data: { workspaceId } });

export const getGroupsByWorkspace = (workspaceId) =>
  axiosClient.get(`/workspaces/${workspaceId}/groups`);

export const getAccountsByGroup = (groupId) => {
  return axiosClient.get(`/groups/${groupId}/accounts`);
};

export const deleteGroup = (groupId, workspaceId) =>
  axiosClient.delete(`/group/${groupId}`, {
    data: { workspaceId },
  });