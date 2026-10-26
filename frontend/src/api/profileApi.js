import axiosClient from './axiosClient';

export const profileApi = {
  getMyProfile: () => axiosClient.get('/profile/me'),
  updateMyProfile: (data) => axiosClient.put('/profile/me', data),
  getTargetCompanies: () => axiosClient.get('/target-companies'),
  getCompanyById: (id) => axiosClient.get(`/target-companies/${id}`),
};
