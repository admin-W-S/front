import api from './api';

/**
 * 인기 강의실 통계 API
 */
export const statsAPI = {
  // Get popular rooms (TOP 5)
  getPopularRooms: () => {
    return api.get('/api/stats/popular')
      .then(response => {
        // 백엔드 응답 형식: { success: true, message: "...", data: [...] }
        return { data: response.data.data || [] };
      })
      .catch(error => {
        const message = error.response?.data?.message || '통계 조회에 실패했습니다.';
        throw { ...error, response: { ...error.response, data: { message } } };
      });
  },
};

