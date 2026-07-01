import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Interceptor for refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    let errorMessage =  error.response?.data?.error;

    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        errorMessage = json.error;
      } catch (e) {
        console.error("Failed to parse blob error", e);
      }
    }

    if (error.response?.status === 401 && errorMessage === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          processQueue(null, accessToken);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/signin";
          return Promise.reject(refreshError);
        }
      } else {
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/signin";
      }
    }
    
    // For other 401 errors (not expired), just logout if no token
    if (error.response?.status === 401 && !localStorage.getItem("accessToken")) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
