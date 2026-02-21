import api from './api';

export const createCase = async (caseData) => {
  const response = await api.post('/cases', caseData);
  return response.data;
};

export const getCases = async () => {
  const response = await api.get('/cases');
  return response.data;
};

export const getCaseById = async (id) => {
  const response = await api.get(`/cases/${id}`);
  return response.data;
};

export const requestSecondOpinion = async (id, specialistId = null) => {
  const response = await api.post(`/cases/${id}/request-second-opinion`, { specialistId });
  return response.data;
};

export const respondToCase = async (id, responseData) => {
  const response = await api.post(`/cases/${id}/respond`, responseData);
  return response.data;
};

export const getCaseResponses = async (id) => {
  const response = await api.get(`/cases/${id}/responses`);
  return response.data;
};

export const getSpecialists = async () => {
  const response = await api.get('/auth/specialists');
  return response.data;
};
