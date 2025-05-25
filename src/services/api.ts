import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function để lấy token từ localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Thêm interceptor cho request để tự động thêm token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response và bắt lỗi 401
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Xử lý lỗi xác thực (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Lưu đường dẫn hiện tại để sau khi đăng nhập lại có thể quay lại
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('redirectPath', currentPath);
      }
      
      // Xóa thông tin đăng nhập
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Thông báo cho người dùng
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      
      // Chuyển hướng đến trang đăng nhập
      window.location.href = '/page/auth/login';
    }
    
    return Promise.reject(error);
  }
);

export default api; 