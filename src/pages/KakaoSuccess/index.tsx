import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "layouts/App";
import useAuthStore from "store/useAuthStore";
import axios from "axios";
import { response } from "express";

const KakaoSuccess = () => {
  const navigate = useNavigate();
  const { kakaoLogin, isLoggedIn } = useAuthStore();

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const code = urlSearchParams.get("code");
    console.log("code=",code)
    if (code) {
      axios
        .post(
          `${process.env.REACT_APP_SERVER_HOST}:${
            process.env.REACT_APP_SERVER_PORT || 3000
          }/api/auth/kakao/callback/code`,
          { code: code },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        )
        .then((response) => {
          const { accessToken } = response.data;
          console.log("response=",response);
          localStorage.setItem("accessToken", accessToken);
          kakaoLogin();
          navigate("/home", { replace: true });
        });
    }
  });

  return (
    <Layout>
      <br />
      Kakao 인증 성공!
    </Layout>
  );
};

export default KakaoSuccess;
