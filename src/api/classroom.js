import api from './api';

// Development mode flag
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || false;

// Mock classrooms data
const mockClassrooms = [
  // 본관
  { id: '1', name: 'A강의실', location: '본관 1층', capacity: 30, available: true, amenities: ['프로젝터', '화이트보드'], description: '중형 강의실' },
  { id: '2', name: 'B강의실', location: '본관 1층', capacity: 50, available: true, amenities: ['프로젝터'], description: '대형 강의실' },
  { id: '3', name: 'C강의실', location: '본관 2층', capacity: 40, available: false, amenities: ['화이트보드'], description: '중형 강의실' },
  { id: '4', name: 'D강의실', location: '본관 2층', capacity: 60, available: true, amenities: ['프로젝터', '마이크'], description: '대형 강의실' },
  { id: '5', name: 'E강의실', location: '본관 3층', capacity: 35, available: true, amenities: ['프로젝터', '화이트보드', '마이크'], description: '최신 시설 강의실' },
  { id: '6', name: 'F강의실', location: '본관 3층', capacity: 45, available: true, amenities: ['프로젝터'], description: '중형 강의실' },
  // 도서관
  { id: '7', name: 'L101', location: '도서관 1층', capacity: 25, available: true, amenities: ['프로젝터'], description: '스터디룸' },
  { id: '8', name: 'L201', location: '도서관 2층', capacity: 30, available: true, amenities: ['화이트보드'], description: '세미나실' },
  { id: '9', name: 'L202', location: '도서관 2층', capacity: 20, available: false, amenities: ['프로젝터'], description: '스터디룸' },
  // 과학관
  { id: '10', name: 'S101', location: '과학관 1층', capacity: 50, available: true, amenities: ['프로젝터', '마이크', '음향시설'], description: '대형 강의실' },
  { id: '11', name: 'S201', location: '과학관 2층', capacity: 40, available: true, amenities: ['프로젝터', '화이트보드'], description: '중형 강의실' },
  // 예술관
  { id: '12', name: 'A101', location: '예술관 1층', capacity: 30, available: true, amenities: ['프로젝터', '음향시설'], description: '음악실' },
  { id: '13', name: 'A201', location: '예술관 2층', capacity: 25, available: true, amenities: ['화이트보드'], description: '미술실' },
];

// Initialize mock classrooms in localStorage if not exists
if (typeof localStorage !== 'undefined') {
  const stored = localStorage.getItem('mock_classrooms');
  if (!stored) {
    localStorage.setItem('mock_classrooms', JSON.stringify(mockClassrooms));
  }
}

// Helper function to get classrooms from localStorage
const getClassrooms = () => {
  const stored = localStorage.getItem('mock_classrooms');
  return stored ? JSON.parse(stored) : mockClassrooms;
};

// Helper function to save classrooms to localStorage
const saveClassrooms = (classrooms) => {
  localStorage.setItem('mock_classrooms', JSON.stringify(classrooms));
};

// Mock classroom operations
const mockClassroomOperations = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: getClassrooms() };
  },

  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const classrooms = getClassrooms();
    const classroom = classrooms.find(c => c.id === id);
    return classroom ? { data: classroom } : Promise.reject({ response: { status: 404 } });
  },

  create: async (classroomData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const classrooms = getClassrooms();
    const newClassroom = {
      id: Date.now().toString(),
      ...classroomData,
      available: true
    };
    classrooms.push(newClassroom);
    saveClassrooms(classrooms);
    return { data: newClassroom };
  },

  update: async (id, classroomData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const classrooms = getClassrooms();
    const index = classrooms.findIndex(c => c.id === id);
    if (index === -1) {
      return Promise.reject({ response: { status: 404 } });
    }
    classrooms[index] = { ...classrooms[index], ...classroomData };
    saveClassrooms(classrooms);
    return { data: classrooms[index] };
  },

  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const classrooms = getClassrooms();
    const index = classrooms.findIndex(c => c.id === id);
    if (index === -1) {
      return Promise.reject({ response: { status: 404 } });
    }
    classrooms.splice(index, 1);
    saveClassrooms(classrooms);
    return { data: { message: 'Deleted successfully' } };
  }
};

// Classroom API
export const classroomAPI = {
  // Get all classrooms
  getAll: (params = {}) => {
    if (DEV_MODE) {
      return mockClassroomOperations.getAll(params);
    }
    return api.get('/rooms', { params });
  },

  // Get classroom by ID
  getById: (id) => {
    if (DEV_MODE) {
      return mockClassroomOperations.getById(id);
    }
    // 백엔드에는 개별 조회가 없으므로 전체 조회 후 필터링
    return api.get('/rooms').then(response => {
      const classroom = response.data.find(r => r.id === parseInt(id));
      if (!classroom) {
        return Promise.reject({ response: { status: 404 } });
      }
      return { data: classroom };
    });
  },

  // Create classroom (admin only)
  create: (classroomData) => {
    if (DEV_MODE) {
      return mockClassroomOperations.create(classroomData);
    }
    // 백엔드 필드명에 맞게 변환
    const { name, location, capacity, projector, whiteboard } = classroomData;
    return api.post('/rooms', { name, location, capacity, projector, whiteboard });
  },

  // Update classroom (admin only)
  update: (id, classroomData) => {
    if (DEV_MODE) {
      return mockClassroomOperations.update(id, classroomData);
    }
    // 백엔드 필드명에 맞게 변환
    const { name, location, capacity, projector, whiteboard } = classroomData;
    return api.put(`/rooms/${id}`, { name, location, capacity, projector, whiteboard });
  },

  // Delete classroom (admin only)
  delete: (id) => {
    if (DEV_MODE) {
      return mockClassroomOperations.delete(id);
    }
    return api.delete(`/rooms/${id}`);
  },
};

