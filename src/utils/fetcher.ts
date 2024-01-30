import axios from "axios";
import { BASE_URL, basicAxios } from "./axios";

export default (url: string) => {
  const accessToken = localStorage.getItem("accessToken");
  return axios
    .get(`${BASE_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    })
    .then((res) => res.data);
};
