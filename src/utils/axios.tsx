import axios from "axios";
import useAuthStore from "../store/useAuthStore";

export const BASE_URL = `${process.env.REACT_APP_SERVER_HOST}:${
  process.env.REACT_APP_SERVER_PORT || 3000
}/api`;

// 기본
export const basicAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-type": "application/json",
  },
  withCredentials: true,
});

// 인증 필요한 경우

export const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    "Content-type": "application/json",
  },
  withCredentials: true,
});

// 토큰 업데이트 함수
export const updateAuthToken = () => {
  authAxios.defaults.headers.Authorization = `Bearer ${localStorage.getItem(
    "accessToken"
  )}`;
};

// 리프레시 토큰으로 엑세스 토큰 업데이트
export const updateAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  const { data } = await axios.post(
    `${process.env.REACT_APP_SERVER_HOST}:${
      process.env.REACT_APP_SERVER_PORT || 3000
    }/api/auth/refresh`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-type": "application/json",
      },
    }
  );
  console.log("data: ", data.data.newAccessToken);
  localStorage.setItem("accessToken", data.data.newAccessToken);
  updateAuthToken();
};

// 파일 포함 axios3
export const imgAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-type": "multipart/form-data",
  },
});

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalConfig = error.config;
    const { logout } = useAuthStore.getState();
    if (error.response.status === 401) {
      try {
        console.log("roatate token");
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("Refresh token not available.");
        }
        const res = await axios.create().post(
          "/api/auth/refresh",
          {},
          {
            baseURL: `${process.env.REACT_APP_SERVER_HOST}:${
              process.env.REACT_APP_SERVER_PORT || 3000
            }`,
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              "Content-type": "application/json",
            },
          }
        );

        const newAccessToken = res.data.accessToken.newAccessToken;
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalConfig);
        }
      } catch (refreshError) {
        console.error(refreshError);
        localStorage.clear();
        logout();
        return Promise.reject(refreshError);
      }
    } else if (error.response.status === 400) {
      // 여기 바꿀 예정..
      console.log("팀이 없는듯?");
    }

    // localStorage.clear();
    return Promise.reject(error);
  }
);
