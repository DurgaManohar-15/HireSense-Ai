import axiosClient from './axiosClient';

export const authApi = {
  register: (data) => axiosClient.post('/auth/register', data),
  login: (data) => axiosClient.post('/auth/login', data),
  googleAuth: (data) => axiosClient.post('/auth/google', data),
  sendPhoneOtp: (phoneNumber) => axiosClient.post('/auth/phone/send-otp', { phoneNumber }),
  verifyPhoneOtp: (data) => axiosClient.post('/auth/phone/verify', data),
  refreshToken: (refreshToken) => axiosClient.post('/auth/refresh-token', { refreshToken }),
  getMe: () => axiosClient.get('/auth/me'),
};

