import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";
import useAuthStore from "store/useAuthStore";

const SendCode = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [remainingTime, setRemainingTime] = useState(180);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (timerStarted && remainingTime > 0) {
      timerRef.current = setTimeout(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => clearTimeout(timerRef.current!);
  }, [timerStarted, remainingTime]);

  // Function to format seconds into "mm:ss" format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds =
      remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const showAlert = (message: string) => {
    window.alert(message);
  };

  const handleEmailSubmit = async () => {
    try {
      const resetPasswordDto = {
        email,
      };

      // Get access token from localStorage
      const accessToken = localStorage.getItem("accessToken");

      // Send reset password request to the server
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/auth/send-password-reset-email`,
        resetPasswordDto,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {

        // Clear the verification code input
        setVerificationCode("");

        // Reset the timer to 180 seconds (3 minutes)
        setRemainingTime(180);
        setTimerStarted(true);
      } else {
        console.error(
          "인증번호 전송 실패:",
          response.data.message || "Unknown error"
        );
        window.alert("인증번호 전송에 실패했습니다.");
      }
    } catch (error: any) {
      console.error(
        "인증번호 전송 실패:",
        error.response?.data?.message || "Unknown error"
      );
      window.alert("인증번호 전송에 실패했습니다.");
    }
  };

  const handleVerificationSubmit = async () => {
    try {
      const verificationData = {
        email,
        verificationCode,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/auth/verify-code`,
        verificationData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {

        showAlert("인증번호 확인 성공");

        // Clear the verification code input
        setVerificationCode("");

        // Move to the resetPassword page only after successful email submission

        navigate("/resetPassword");
      }
    } catch (error: any) {
      console.error(
        "인증번호 확인 실패:",
        error.response?.data?.message || "Unknown error"
      );

      if (error.response?.data?.isDormantMode) {
        showAlert(
          "휴면 모드로 전환되었습니다. 인증번호 검증을 3번 실패하여 휴면 모드로 전환되었습니다."
        );
      } else {
        showAlert("인증번호 확인에 실패했습니다.");
      }
    }
  };

  return (
    <div>
      <h2>비밀번호 찾기</h2>

      <input
        type="email"
        placeholder="이메일을 입력하세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleEmailSubmit}>이메일 전송</button>

      <input
        type="text"
        placeholder="인증번호를 입력하세요"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
      />
      <button onClick={handleVerificationSubmit}>확인</button>

      {timerStarted && remainingTime > 0 && (
        <p>남은 시간: {formatTime(remainingTime)}</p>
      )}
    </div>
  );
};

export default SendCode;
