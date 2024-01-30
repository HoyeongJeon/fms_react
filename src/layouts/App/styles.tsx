import { Link } from "react-router-dom";
import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  gap: 0.5rem;
`;

export const Menu = styled.nav`
  width: 13%;
  height: 90%;
  background-color: white;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const MenuItem = styled.p`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: normal; // 기본값은 normal로 설정

  &:hover {
    font-weight: bold; // hover 시에 bold로 변경
  }
`;


export const Card = styled.div`
  width: 80%;
  height: 90%;
  background-color: white;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const StyledLink = styled(Link)`
  color: #445664;
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
`;

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

export const ErrorMessage = styled.p`
  color: #000;
  text-align: center;
`;

export const Button = styled.button`
  padding: 10px 20px;
  min-width: 150px; // 버튼의 최소 너비 설정
  border: none;
  border-radius: 20px;
  background-color: #000;
  color: #fff;
  cursor: pointer;
  font-size: 1rem; // 폰트 크기 조정
  margin: 0 5px; // 버튼 사이의 간격 조정

  &:hover {
    background-color: #555;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const ProfileSection = styled.div`
  width: 100%;
  height: 100px; // You can adjust this to your liking
  background-color: #f5f5f5; // Choose a background color that fits the theme
  display: flex;
  justify-content: center;
  align-items: center;
`;
