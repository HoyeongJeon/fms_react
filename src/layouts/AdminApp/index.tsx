import React, { useEffect, useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import fetcher from "utils/fetcher";
import { Card, Menu, MenuItem, PageContainer, StyledLink } from "./styles";

interface LayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  // const { data, error } = useSWR("/users/me", fetcher);
  const [role, setRole] = useState<string>("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <PageContainer>
      <Menu>
        <MenuItem>
          <StyledLink to="/home">HOME</StyledLink>
        </MenuItem>
        <MenuItem>
          <StyledLink to="/admin/members">회원관리</StyledLink>
        </MenuItem>
        <MenuItem>
          <StyledLink to="/admin/teams">팀 관리</StyledLink>
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          style={{
            color: "#445664",
          }}
        >
          LOGOUT
        </MenuItem>
      </Menu>
      <Card>
        <h2>
          <StyledLink to="/home">
            Football Management System (FMS) ⚽🔥
          </StyledLink>
        </h2>
        {/* {teamId ? (
          <div>Your content here</div>
        ) : (
          <ErrorContainer>
            <ErrorMessage>
              속한 팀이 없습니다.
              <br />
              팀을 생성하거나 팀에 참가하세요.
            </ErrorMessage>
            <Button onClick={() => navigate("/team/create")}>팀 생성</Button>
            <Button onClick={() => navigate("/team/join")}>팀 참가하기</Button>
          </ErrorContainer>
        )} */}
        {children}
      </Card>
    </PageContainer>
  );
};

export default AdminLayout;
