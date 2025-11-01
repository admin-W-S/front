import api from './api';

// Development mode flag (set to true to use mock data without backend)
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || false;

// Mock authentication for development
const mockAuth = {
  loginStudent: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return {
      data: {
        user: {
          id: '1',
          name: '테스트 학생',
          email: credentials.email,
          token: 'mock-token-student-12345'
        }
      }
    };
  },
  
  loginAdmin: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        user: {
          id: '2',
          name: '테스트 관리자',
          email: credentials.email,
          token: 'mock-token-admin-12345'
        }
      }
    };
  },
  
  signupStudent: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        user: {
          id: Math.random().toString(36).substr(2, 9),
          name: userData.name,
          email: userData.email,
          token: 'mock-token-student-' + Date.now()
        }
      }
    };
  },
  
  signupAdmin: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        user: {
          id: Math.random().toString(36).substr(2, 9),
          name: userData.name,
          email: userData.email,
          token: 'mock-token-admin-' + Date.now()
        }
      }
    };
  },
  
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { data: { message: 'Logged out' } };
  },
  
  getCurrentUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = localStorage.getItem('user');
    return { data: { user: user ? JSON.parse(user) : null } };
  }
};

// Authentication API
export const authAPI = {
  // Student login (백엔드에서는 email, password만 필요)
  loginStudent: (credentials) => {
    if (DEV_MODE) {
      return mockAuth.loginStudent(credentials);
    }
    return api.post('/login', { email: credentials.email, password: credentials.password })
      .then(response => {
        // 백엔드 응답 형식: { success: true, message: "...", data: user }
        // 프론트엔드가 기대하는 형식: { data: { user } }
        return { data: { user: response.data.data } };
      })
      .catch(error => {
        // 에러 응답 형식: { success: false, message: "...", data: null }
        const message = error.response?.data?.message || '로그인에 실패했습니다.';
        throw { ...error, response: { ...error.response, data: { message } } };
      });
  },

  // Admin login
  loginAdmin: (credentials) => {
    if (DEV_MODE) {
      return mockAuth.loginAdmin(credentials);
    }
    return api.post('/login', { email: credentials.email, password: credentials.password })
      .then(response => {
        // 백엔드 응답 형식: { success: true, message: "...", data: user }
        // 프론트엔드가 기대하는 형식: { data: { user } }
        return { data: { user: response.data.data } };
      })
      .catch(error => {
        // 에러 응답 형식: { success: false, message: "...", data: null }
        const message = error.response?.data?.message || '로그인에 실패했습니다.';
        throw { ...error, response: { ...error.response, data: { message } } };
      });
  },

  // Student signup
  signupStudent: (userData) => {
    if (DEV_MODE) {
      return mockAuth.signupStudent(userData);
    }
    return api.post('/signup', { ...userData, role: 'student' })
      .then(response => {
        // 백엔드 응답 형식: { success: true, message: "...", data: user }
        // 프론트엔드가 기대하는 형식: { data: { user } }
        return { data: { user: response.data.data } };
      })
      .catch(error => {
        // 에러 응답 형식: { success: false, message: "...", data: null }
        const message = error.response?.data?.message || '회원가입에 실패했습니다.';
        throw { ...error, response: { ...error.response, data: { message } } };
      });
  },

  // Admin signup
  signupAdmin: (userData) => {
    if (DEV_MODE) {
      return mockAuth.signupAdmin(userData);
    }
    return api.post('/signup', { ...userData, role: 'admin' })
      .then(response => {
        // 백엔드 응답 형식: { success: true, message: "...", data: user }
        // 프론트엔드가 기대하는 형식: { data: { user } }
        return { data: { user: response.data.data } };
      })
      .catch(error => {
        // 에러 응답 형식: { success: false, message: "...", data: null }
        const message = error.response?.data?.message || '회원가입에 실패했습니다.';
        throw { ...error, response: { ...error.response, data: { message } } };
      });
  },

  // Logout
  logout: () => {
    if (DEV_MODE) {
      return mockAuth.logout();
    }
    return Promise.resolve({ data: { message: 'Logged out' } });
  },

  // Get current user
  getCurrentUser: () => {
    if (DEV_MODE) {
      return mockAuth.getCurrentUser();
    }
    // 백엔드에 현재 사용자 조회 API가 없으므로 localStorage에서 가져옴
    const user = localStorage.getItem('user');
    return Promise.resolve({ data: { user: user ? JSON.parse(user) : null } });
  },

  // Get students list (for group reservation)
  getStudents: () => {
    if (DEV_MODE) {
      // Mock students
      return Promise.resolve({
        data: [
          { id: 2, name: '윤인서', email: 'inseo3040@gmail.com' },
          { id: 3, name: 'd', email: 'kkong3040@naver.com' },
          { id: 4, name: '박재연', email: 'pjy0192@naver.com' },
        ]
      });
    }
    return api.get('/api/auth/students')
      .then(response => {
        return { data: response.data.data || [] };
      })
      .catch(error => {
        const message = error.response?.data?.message || '학생 목록 조회에 실패했습니다.';
        throw { ...error, response: { ...error.response, data: { message } } };
      });
  },
};

