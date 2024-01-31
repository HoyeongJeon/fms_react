import "../SignUp/signup.css";
import axios from "axios";
import {
  Container,
  FormContainer,
  Label,
  LinkContainer,
  StyledButton,
  StyledForm,
  StyledInput,
} from "pages/SignUp/styles";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTokenStore } from "store/tokenStore";
import useAuthStore from "store/useAuthStore";
import { Alert, Button, Form, Input } from "antd";
import { set } from "date-fns";
import { basicAxios } from "utils/axios";
import constructWithOptions from "styled-components/dist/constructors/constructWithOptions";

const LogIn = () => {
  const { accessToken } = useTokenStore();
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });
  const { email, password } = inputs;
  const { login, isLoggedIn } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState("");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await basicAxios.post("/auth/sign-in", { email, password });
      console.log(res.data.data.accessToken);
      localStorage.setItem("accessToken", res.data.data.accessToken);
      localStorage.setItem("refreshToken", res.data.data.refreshToken);
      login();
      navigate("/home", { replace: true });
    } catch (err: any) {
      console.log(err);
      // alert(err.response?.data?.message);
      setErrorMessage(err.response?.data?.message || "로그인에 실패했습니다.");
      setInputs({
        email: "",
        password: "",
      });
    }
  };

  const CLIENT_ID = `${process.env.REACT_APP_KAKAO_LOGIN_API_KEY}`;
  const REDIRECT_URI = `${process.env.REACT_APP_SERVER_HOST}:${
    process.env.REACT_APP_SERVER_PORT || 3000
  }/api/auth/kakao/callback`;
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  console.log("CLIENT_ID =", CLIENT_ID);
  console.log("EDIRECT_UR I=", REDIRECT_URI);
  console.log("kakaoURL =", kakaoURL);

  const onKakaoLoginClick = async () => {
    window.location.href = kakaoURL;
  };

  return (
    <Container>
      <FormContainer>
        <StyledForm onSubmit={onSubmit}>
          {errorMessage && (
            <Alert
              message="에러"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage("")}
            />
          )}
          <Label>
            <span>이메일</span>
            <div>
              <StyledInput
                type="email"
                name="email"
                placeholder="이메일"
                value={email}
                onChange={onChange}
                required
              />
            </div>
          </Label>
          <Label>
            <span>비밀번호</span>
            <div>
              <StyledInput
                type="password"
                name="password"
                placeholder="비밀번호"
                value={password}
                onChange={onChange}
                required
              />
            </div>
          </Label>
          <Label>
            <StyledButton type="submit">로그인</StyledButton>
          </Label>
          <LinkContainer className="CenterAlign">
            {" "}
            {/* Apply the CenterAlign class here */}
            아직 회원이 아니신가요?&nbsp;
            <Link to="/signup">회원가입 하러가기</Link>
          </LinkContainer>
          <LinkContainer className="CenterAlign">
            {" "}
            {/* Apply the CenterAlign class here */}
            비밀번호를 잊으셨나요?&nbsp;
            <Link to="/emailCode">비밀번호 찾기</Link>
          </LinkContainer>
          <LinkContainer className="CenterAlign">
            {" "}
            {/* Apply the CenterAlign class here */}
            &nbsp;
            <Link to="/home">메인화면으로 돌아가기</Link>
          </LinkContainer>
          <div
            className="ms-auto kakao-login-container"
            style={{ cursor: "pointer", width: "100%" }}>
            <img
              src="img/kakao_login_image.png"
              alt="카카오 로그인"
              style={{ cursor: "pointer", width: "100%" }}
              onClick={onKakaoLoginClick}
            />
          </div>
        </StyledForm>
      </FormContainer>
    </Container>
  );
};

export default LogIn;
