import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import fetcher from "utils/fetcher";
import { useTeamStore } from "store/teamStore";
import { useUserStore } from "store/userStore";
import { useProfileStore } from "store/profileStore";
import useAuthStore from "store/useAuthStore";
import {
  Card,
  Menu,
  MenuItem,
  PageContainer,
  ProfileSection,
  StyledLink,
} from "./styles";
import { Typography } from "antd";
import { useMemberStore } from "store/memberStore";

const { Title } = Typography;
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * To Do
 * 1. 유저 정보 저장하기
 * 2. 프로필 페이지 만들기
 * 3. 프로필 페이지에서 서버로 데이터 전송
 */

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data, error } = useSWR(
    "/users/me",
    fetcher
    // { dedupingInterval: 1000 * 60 * 60 * 24 }
  );
  const { setMember } = useMemberStore();
  const { teamId, setTeamInfo, chatId } = useTeamStore();
  const { id: userId, setUser, role } = useUserStore();
  const { logout } = useAuthStore();
  const { setProfile, id: profileId, resetProfile } = useProfileStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      resetProfile();
      setUser(data.data);
      setTeamInfo(
        data.data.member[0]?.team?.id,
        data.data.member[0]?.team?.name,
        data.data.member[0]?.team?.imageUUID,
        data.data.member[0]?.team?.chat?.id
      );
    }
    if (data?.data.profile) {
      setProfile(data.data.profile);
    }
  }, [data]);
  const handleLogout = () => {
    // clearTeamInfo();
    logout();
    navigate("/login");
  };

  return (
    <PageContainer>
      <Menu>
        <MenuItem>
          <StyledLink to="/home">HOME</StyledLink>
        </MenuItem>
        <MenuItem>
          <StyledLink
            to={
              profileId
                ? `/profile/${profileId}`
                : `/profile/${userId}/register`
            }
          >
            MY PROFILE
          </StyledLink>
        </MenuItem>

        {teamId ? (
          <>
            <MenuItem>
              <StyledLink to="/team">TEAM</StyledLink>
            </MenuItem>
            <MenuItem>
              <StyledLink to="/match/calendar">SCHEDULE</StyledLink>
            </MenuItem>
            <MenuItem>
              <StyledLink to="/player">PLAYER</StyledLink>
            </MenuItem>
            <MenuItem>
              <StyledLink to="/strategy">STRATEGY</StyledLink>
            </MenuItem>
          </>
        ) : (
          <></>
        )}

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

        {children}
      </Card>
    </PageContainer>
  );
};

export default Layout;
function clearTeamInfo() {
  throw new Error("Function not implemented.");
}
