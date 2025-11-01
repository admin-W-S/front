import api from './api';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || false;

export const notificationsAPI = {
  // Get my notifications
  getMyNotifications: () => {
    if (DEV_MODE) {
      return Promise.resolve({ data: [] });
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      return Promise.reject({ response: { status: 401, data: { message: '로그인이 필요합니다.' } } });
    }
    return api.get(`/api/notifications/${user.id}`)
      .then(response => ({ data: response.data.data || [] }))
      .catch(error => {
        const message = error.response?.data?.message || '알림 목록 조회에 실패했습니다.';
        throw { ...error, response: { ...error.response, data: { message } } };
      });
  },

  // Mark notification as read
  markAsRead: (id) => {
    if (DEV_MODE) {
      return Promise.resolve({ data: {} });
    }
    return api.patch(`/api/notifications/${id}`)
      .then(response => ({ data: response.data.data }))
      .catch(error => {
        const message = error.response?.data?.message || '알림 읽음 처리에 실패했습니다.';
        throw { ...error, response: { ...error.response, data: { message } } };
      });
  }
};

