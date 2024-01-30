import React, { useState } from 'react';
import './styles.css';

const ResetPassword = () => {

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState('email');


  const handlePasswordSubmit = () => {
    // 새로운 비밀번호 저장 등 로직 구현
    // 성공 시 다음 단계로 전환
    setCurrentStep('confirmPassword');
  };

  const handleConfirmPasswordSubmit = () => {
    // 비밀번호 확인 로직 구현
    if (confirmPassword === password) {
      // 비밀번호 확인 성공
      alert('비밀번호 재설정이 완료되었습니다.');
    } else {
      // 비밀번호 확인 실패
      alert('비밀번호가 일치하지 않습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div>
      {currentStep === 'password' && (
        <>
          <h2>비밀번호 입력</h2>
          <input
            type="password"
            placeholder="새로운 비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handlePasswordSubmit}>확인</button>
        </>
      )}

      {currentStep === 'confirmPassword' && (
        <>
          <h2>비밀번호 확인</h2>
          <input
            type="password"
            placeholder="비밀번호를 확인하세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={handleConfirmPasswordSubmit}>확인</button>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
