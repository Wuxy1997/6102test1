import axios from 'axios';

// API基础URL
const API_BASE_URL = 'http://backend:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token到请求头
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理常见错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401错误 - 未授权
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户认证相关API
export const authAPI = {
  // 用户注册
  register: (userData) => {
    return api.post('/auth/register', userData);
  },
  
  // 用户登录
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },
  
  // 获取用户资料
  getProfile: () => {
    return api.get('/auth/profile');
  },
  
  // 更新用户资料
  updateProfile: (profileData) => {
    return api.put('/auth/profile', profileData);
  }
};

// 身体数据相关API
export const physicalDataAPI = {
  // 添加身体数据
  addPhysicalData: (data) => {
    return api.post('/physical-data', data);
  },
  
  // 获取身体数据历史
  getPhysicalData: () => {
    return api.get('/physical-data');
  }
};

// 运动记录相关API
export const exerciseAPI = {
  // 添加运动记录
  addExercise: (data) => {
    return api.post('/exercises', data);
  },
  
  // 获取运动记录历史
  getExercises: () => {
    return api.get('/exercises');
  }
};

// AI推荐相关API
export const recommendationAPI = {
  // 获取膳食推荐
  getDietRecommendation: () => {
    return api.post('/recommendations/diet');
  },
  
  // 获取运动计划推荐
  getWorkoutRecommendation: () => {
    return api.post('/recommendations/workout');
  },
  
  // 获取膳食推荐历史
  getDietRecommendations: () => {
    return api.get('/recommendations/diet');
  },
  
  // 获取运动计划推荐历史
  getWorkoutRecommendations: () => {
    return api.get('/recommendations/workout');
  }
};

export default api;
