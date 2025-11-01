import api from './api.js';

const DEV_MODE = false;

// Waitlist API
export const waitlistAPI = {
  // Create waitlist entry
  create: (waitlistData) => {
    if (DEV_MODE) {
      return Promise.resolve({ data: {} });
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      return Promise.reject({ response: { status: 401 } });
    }

    const payload = {
      userId: parseInt(user.id),
      roomId: parseInt(waitlistData.roomId),
      date: waitlistData.date,
      startTime: waitlistData.startTime,
      endTime: waitlistData.endTime,
    };

    return api.post('/api/waitlist', payload)
      .then(response => {
        return { data: response.data.data || {} };
      })
      .catch(error => {
        const message = error.response?.data?.message || '대기 신청에 실패했습니다.';
        throw { ...error, response: { ...error.response, data: { message } } };
      });
  },

  // Get my waitlist
  getMyWaitlist: () => {
    if (DEV_MODE) {
      return Promise.resolve({ data: [] });
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      return Promise.reject({ response: { status: 401 } });
    }
    return api.get(`/api/waitlist/${user.id}`)
      .then(response => {
        return { data: response.data.data || [] };
      })
      .catch(error => {
        const message = error.response?.data?.message || '대기 목록 조회에 실패했습니다.';
        throw { ...error, response: { ...error.response, data: { message } } };
      });
  },

  // Cancel waitlist entry
  cancel: (waitlistId) => {
    if (DEV_MODE) {
      return Promise.resolve({ data: {} });
    }
    return api.delete(`/api/waitlist/${waitlistId}`)
      .then(response => {
        return { data: response.data.data || {} };
      })
      .catch(error => {
        const message = error.response?.data?.message || '대기 신청 취소에 실패했습니다.';
        throw { ...error, response: { ...error.response, data: { message } } };
      });
  },
};

