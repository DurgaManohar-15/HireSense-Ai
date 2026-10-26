import axiosClient from './axiosClient';

export const coverLetterApi = {
  getMyCoverLetters: () => axiosClient.get('/cover-letters').then((res) => res.data),
  getCoverLetterById: (id) => axiosClient.get(`/cover-letters/${id}`).then((res) => res.data),
  generateCoverLetter: (data) => axiosClient.post('/cover-letters/generate', data).then((res) => res.data),
  updateCoverLetter: (id, data) => axiosClient.put(`/cover-letters/${id}`, data).then((res) => res.data),
  deleteCoverLetter: (id) => axiosClient.delete(`/cover-letters/${id}`).then((res) => res.data),
  extractFileText: (formData) =>
    axiosClient
      .post('/cover-letters/extract-file-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data),
};
