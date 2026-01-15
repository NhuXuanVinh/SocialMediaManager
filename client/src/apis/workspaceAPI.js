// apis/workspaceAPI.js
import axiosClient from './axiosClient';

export const addWorkspaceMember = (workspaceId, payload) =>
  axiosClient.post(`/workspaces/${workspaceId}/members`, payload);

export const getWorkspaceMembers = (workspaceId) =>
  axiosClient.get(`/workspaces/${workspaceId}/members`);

export const getMyWorkspaces = () =>
  axiosClient.get('/workspaces/me');

export const getMyWorkspaceRole = (workspaceId) =>
  axiosClient.get(`/workspaces/${workspaceId}/me`);

export const updateWorkspaceMemberRole = (workspaceId, memberId, role) => {
  return axiosClient.patch(
    `/workspaces/${workspaceId}/members/${memberId}`,
    { role }
  );
};

export const removeWorkspaceMember = (workspaceId, memberId) => {
  return axiosClient.delete(
    `/workspaces/${workspaceId}/members/${memberId}`
  );
};

