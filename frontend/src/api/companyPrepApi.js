import axiosClient from './axiosClient';

export const companyPrepApi = {
  getCompanies: () => axiosClient.get('/company-prep'),
  getCompanyDetails: (id) => axiosClient.get(`/company-prep/${id}`),
  getAllCompanyGuides: () => axiosClient.get('/company-prep'),
  getCompanyGuideById: (id) => axiosClient.get(`/company-prep/${id}`),
};

export default companyPrepApi;
