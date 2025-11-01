import api from './api';

// Development mode flag
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || false;

// Helper function to get reservations from localStorage
const getReservations = () => {
  const stored = localStorage.getItem('mock_reservations');
  return stored ? JSON.parse(stored) : [];
};

// Helper function to save reservations to localStorage
const saveReservations = (reservations) => {
  localStorage.setItem('mock_reservations', JSON.stringify(reservations));
};

// Mock reservation operations
const mockReservationOperations = {
  getAll: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: getReservations() };
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const reservations = getReservations();
    const reservation = reservations.find(r => r.id === id);
    return reservation ? { data: reservation } : Promise.reject({ response: { status: 404 } });
  },

  getMyReservations: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const reservations = getReservations();
    const myReservations = reservations.filter(r => r.userId === user.id);
    return { data: myReservations };
  },

  create: async (reservationData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Get classroom info
    const classrooms = JSON.parse(localStorage.getItem('mock_classrooms') || '[]');
    const classroom = classrooms.find(c => c.id === reservationData.classroomId);
    
    const reservations = getReservations();
    const newReservation = {
      id: Date.now().toString(),
      ...reservationData,
      userId: user.id,
      status: 'confirmed',
      classroom: classroom
    };
    reservations.push(newReservation);
    saveReservations(reservations);
    return { data: newReservation };
  },

  update: async (id, reservationData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const reservations = getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) {
      return Promise.reject({ response: { status: 404 } });
    }
    reservations[index] = { ...reservations[index], ...reservationData };
    saveReservations(reservations);
    return { data: reservations[index] };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const reservations = getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) {
      return Promise.reject({ response: { status: 404 } });
    }
    reservations.splice(index, 1);
    saveReservations(reservations);
    return { data: { message: 'Deleted successfully' } };
  },

  getAvailableSlots: async (classroomId, date) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Generate available time slots (9:00-18:00, hourly)
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({ start: startTime, end: endTime });
    }
    return { data: slots };
  }
};

// Reservation API
export const reservationAPI = {
  // Get all reservations (백엔드에는 전체 조회가 없으므로 빈 배열 반환)
  getAll: (params = {}) => {
    if (DEV_MODE) {
      return mockReservationOperations.getAll(params);
    }
    // 백엔드에는 전체 예약 조회가 없으므로 빈 배열 반환
    return Promise.resolve({ data: [] });
  },

  // Get reservation by ID (백엔드에는 개별 조회가 없으므로 사용자 예약 조회 후 필터링)
  getById: (id) => {
    if (DEV_MODE) {
      return mockReservationOperations.getById(id);
    }
    // 백엔드에는 개별 조회가 없으므로 사용자 예약 조회 후 필터링
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      return Promise.reject({ response: { status: 401 } });
    }
    return api.get(`/reservations/user/${user.id}`).then(response => {
      const reservation = response.data.find(r => r.id === id);
      if (!reservation) {
        return Promise.reject({ response: { status: 404 } });
      }
      return { data: reservation };
    });
  },

  // Get my reservations
  getMyReservations: () => {
    if (DEV_MODE) {
      return mockReservationOperations.getMyReservations();
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      return Promise.reject({ response: { status: 401 } });
    }
    return api.get(`/reservations/user/${user.id}`);
  },

  // Create reservation
  create: (reservationData) => {
    if (DEV_MODE) {
      return mockReservationOperations.create(reservationData);
    }
    // 백엔드 필드명에 맞게 변환
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      return Promise.reject({ response: { status: 401 } });
    }
    const { classroomId, date, start_time, end_time } = reservationData;
    return api.post('/reservations', {
      user_id: user.id,
      room_id: parseInt(classroomId),
      date,
      start_time,
      end_time
    });
  },

  // Update reservation (백엔드에는 업데이트가 없으므로 에러 반환)
  update: (id, reservationData) => {
    if (DEV_MODE) {
      return mockReservationOperations.update(id, reservationData);
    }
    // 백엔드에는 예약 업데이트가 없음
    return Promise.reject({ response: { status: 405, message: 'Update not supported' } });
  },

  // Delete reservation
  delete: (id) => {
    if (DEV_MODE) {
      return mockReservationOperations.delete(id);
    }
    return api.delete(`/reservations/${id}`);
  },

  // Get available time slots for a classroom and date (백엔드의 /search 사용)
  getAvailableSlots: (classroomId, date) => {
    if (DEV_MODE) {
      return mockReservationOperations.getAvailableSlots(classroomId, date);
    }
    // 백엔드에는 사용 가능 시간 조회가 없으므로 빈 강의실 검색 API 사용
    // 시간 슬롯은 프론트엔드에서 생성 (9:00-18:00)
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({ start: startTime, end: endTime });
    }
    return Promise.resolve({ data: slots });
  },

  // Search available rooms for a specific date and time
  searchAvailableRooms: (date, start_time, end_time) => {
    return api.get('/search', {
      params: { date, start_time, end_time }
    });
  },
};

