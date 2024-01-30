import React, { useState } from "react";
import {
  Card,
  Menu,
  MenuItem,
  PageContainer,
  StyledLink,
} from "../../layouts/App/styles";
import { ErrorContainer, ErrorMessage } from "pages/Home/styles";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const StyledButton = styled(Button)`
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

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutPreview: React.FC<LayoutProps> = ({ children }) => {
  return (
    <PageContainer>
      <Menu>
        <MenuItem>
          <StyledLink to="/home">HOME</StyledLink>
        </MenuItem>
        {/* <MenuItem>
          <StyledLink
            to={
              profileId
                ? `/profile/${profileId}`
                : `/profile/${userId}/register`
            }
          >
            MY PROFILE
          </StyledLink>
        </MenuItem> */}
        <MenuItem>
          <StyledLink to="/team">TEAM</StyledLink>
        </MenuItem>
        <MenuItem>
          <StyledLink to="/player">PLAYER</StyledLink>
        </MenuItem>
        <MenuItem>
          <StyledLink to="/strategy">STRATEGY</StyledLink>
        </MenuItem>
      </Menu>
      <Card>
        <h2>
          <StyledLink to="/home">
            Football Management System (FMS) ⚽🔥
          </StyledLink>
        </h2>
        {children}
      </Card>
    </PageContainer>
  );
};

export default LayoutPreview;
