import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Container,
  FormContainer,
  Label,
  LinkContainer,
  StyledButton,
  StyledForm,
  StyledInput,
  Title,
} from "./styles";

const SignUp = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    email: "",
    name: "",
    password: "",
    passwordConfirm: "",
  });
  const { email, name, password, passwordConfirm } = inputs;

  const [passwordStrengthMessage, setPasswordStrengthMessage] = useState(
    "비밀번호는 영문 알파벳 대,소문자, 숫자, 특수문자(!@#$%^&*)를 포함해서 8자리 이상으로 입력해야 합니다."
  );

  const [alertMessage, setAlertMessage] = useState("");

  const isStrong = (password: string): boolean => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value, name } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });

    const strengthMessage = isStrong(value)
      ? "강력한 비밀번호입니다."
      : "비밀번호는 영문 알파벳 대,소문자, 숫자, 특수문자(!@#$%^&*)를 포함해서 8자리 이상으로 입력해야 합니다.";
    setPasswordStrengthMessage(strengthMessage);
  };

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setAlertMessage("비밀번호가 일치하지 않습니다.");
      setInputs({
        ...inputs,
        password: "",
        passwordConfirm: "",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/auth/sign-up`,
        {
          email,
          name,
          password,
          passwordConfirm,
        },
        {
          withCredentials: true,
        }
      );

      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };
  const CLIENT_ID = `${process.env.REACT_APP_KAKAO_LOGIN_API_KEY}`;
  const REDIRECT_URI = `${process.env.REACT_APP_SERVER_HOST}:${
    process.env.REACT_APP_SERVER_PORT || 3000
  }/api/auth/kakao/callback`;
  
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  
  const onKakaoLoginClick = async () => {
    window.location.href = kakaoURL;
  };

  return (
    <Container>
      <FormContainer>
        <Title>회원가입</Title>
        <StyledForm onSubmit={onSubmit}>
          <Label>
            <span>이메일</span>
            <div style={{ alignItems: "center" }}>
              <StyledInput
                type="email"
                name="email"
                placeholder="이메일"
                value={email}
                onChange={onChange}
              />
            </div>
          </Label>
          <Label>
            <span>이름</span>
            <div>
              <StyledInput
                type="text"
                name="name"
                placeholder="이름"
                value={name}
                onChange={onChange}
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
              />
            </div>
            <div style={{ fontSize: "12px", color: "gray" }}>
              {passwordStrengthMessage}
            </div>
          </Label>
          <Label>
            <span>비밀번호 확인</span>
            <div>
              <StyledInput
                type="password"
                name="passwordConfirm"
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={onChange}
              />
            </div>
          </Label>
          <StyledButton type="submit">가입완료</StyledButton>
        </StyledForm>
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
        {alertMessage && <p>{alertMessage}</p>}
        <LinkContainer>
          이미 회원이신가요?&nbsp;
          <Link to="/login">로그인 하러가기</Link>
        </LinkContainer>
      </FormContainer>
    </Container>
  );
};

export default SignUp;
