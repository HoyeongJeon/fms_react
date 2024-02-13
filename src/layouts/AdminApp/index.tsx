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

  // useEffect(() => {
  //   // 데이터 로딩 상태 확인 및 role 설정
  //   axios
  //     .get("/users/me", {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  //       },
  //     })
  //     .then((res) => {
  //       console.log("res=", res);
  //       setRole(res.data.role);
  //     });
  // }, []);

  // useEffect(() => {
  //   // role 상태가 업데이트된 후에 체크하여 Admin이 아니면 리다이렉트
  //   if (role !== "Admin") {
  //     alert("Redirecting because role is not Admin.");
  //     navigate("/home"); // 또는 다른 비권한 페이지로 리다이렉트
  //   }
  // }, [role, navigate]);

  // 유저 정보를 저장하고 있어야함

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
