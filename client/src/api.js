import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const createCase = (data) => api.post('/cases', data);
export const getCase = (id) => api.get(`/cases/${id}`);
export const discoverClue = (caseId, clueId) => api.post(`/cases/${caseId}/clues/${clueId}/discover`);
export const requestHint = (caseId) => api.post(`/cases/${caseId}/hints`);
export const submitAccusation = (caseId, suspectId) => api.post(`/cases/${caseId}/accuse`, { suspectId });
export const getCaseResult = (caseId) => api.get(`/cases/${caseId}/result`);

export default api;