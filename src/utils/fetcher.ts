// import axios from "axios";
// import { BASE_URL } from "./axios";

// export default (url: string) => {
//   // localStorage에서 accessToken을 가져옵니다.
//   const accessToken = localStorage.getItem("accessToken");
//   console.log("AccessToken = ", accessToken);
//   // axios 요청을 보낼 때 Authorization 헤더에 accessToken을 포함합니다.
//   return axios
//     .get(BASE_URL + url, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//       withCredentials: true,
//     })
//     .then((res) => res.data);
// };

// import axios from "axios";
// import { BASE_URL, authAxios } from "./axios";

// axios.interceptors.response.use(
//   (response) => {
//     console.log("response");
//     console.log(response);
//     return response;
//   },

//   async (error) => {
//     console.log("error: ", error);
//     // const {
//     //   config,
//     //   response: { status },
//     // } = error;

//     // if (status === 401) {
//     //   await updateAccessToken();
//     //   return axios(config);
//     // }
//   }
// );

// export default (url: string) => {
//   // localStorage에서 accessToken을 가져옵니다.

//   // axios 요청을 보낼 때 Authorization 헤더에 accessToken을 포함합니다.
//   return authAxios.get(BASE_URL + url).then((res) => res.data);
// };

import axios from "axios";
import { BASE_URL, basicAxios } from "./axios";

// // 새로운 access token을 발급받는 함수
// const updateAccessToken = async () => {
//   const refreshToken = localStorage.getItem("refreshToken");
//   try {
//     const response = await basicAxios.post("/auth/refresh", {
//       refreshToken,
//     });
//     const { accessToken } = response.data;
//     localStorage.setItem("accessToken", accessToken);
//     return accessToken;
//   } catch (error) {
//     // refresh token이 유효하지 않은 경우, 로그아웃 처리 등의 추가 조치가 필요할 수 있습니다.
//     console.error("Unable to refresh access token", error);
//     throw error;
//   }
// };

// axios.interceptors.response.use(
//   (response) => {
//     // 정상 응답을 반환합니다.
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     // 401 에러가 발생하고, 요청이 이미 재시도된 적이 없다면
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true; // 재시도 표시를 합니다.

//       try {
//         const newAccessToken = await updateAccessToken(); // access token을 갱신합니다.
//         axios.defaults.headers.common[
//           "Authorization"
//         ] = `Bearer ${newAccessToken}`; // 모든 요청의 기본 헤더를 업데이트합니다.
//         originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`; // 현재 요청의 헤더를 업데이트합니다.

//         return axios(originalRequest); // 요청을 다시 시도합니다.
//       } catch (refreshError) {
//         return Promise.reject(refreshError);
//       }
//     }

//     // 다른 모든 에러는 그대로 반환합니다.
//     return Promise.reject(error);
//   }
// );

export default (url: string) => {
  const accessToken = localStorage.getItem("accessToken");
  // authAxios 인스턴스 대신에 직접 설정된 헤더를 사용하여 요청을 보냅니다.
  return axios
    .get(`${BASE_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    })
    .then((res) => res.data);
};
