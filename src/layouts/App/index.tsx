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
  const { id: memberId, setMemberId, setMember, isStaff } = useMemberStore();
  const { teamId, setTeamInfo, chatId } = useTeamStore();
  const { id: userId, setUser, role } = useUserStore();
  const { logout } = useAuthStore();
  const {
    setProfile,
    id: profileId,
    resetProfile,
    imageUUID,
  } = useProfileStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      resetProfile();

      setUser(data.data);
      setTeamInfo(
        data.data.member[0]?.team?.id || data.data.team?.id,
        data.data.member[0]?.team?.name || data.data.team?.name,
        data.data.member[0]?.team?.imageUUID || data.data.team?.imageUUID,
        data.data.member[0]?.team?.chat?.id || data.data.team?.chat?.id
      );
      setMemberId(data.data?.member[0]?.id);
      setMember(data.data?.member[0]);
    }

    if (data?.data.profile) {
      setProfile(data.data.profile);
      console.log("imageUUID1", data.data.profile);
      console.log("imageUUID2", data.data.profile.imageUUID);
    }
  }, [data]);
  const handleLogout = () => {
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
                : userId
                ? `/profile/${userId}/register`
                : "/home"
            }
            onClick={() => {
              if (!profileId && !userId) {
                alert("죄송합니다! MY PROFILE을 다시 클릭해주세요");
                navigate("/home");
              }
            }}>
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
            {isStaff ? (
              <>
                <MenuItem>
                  <StyledLink to="/memberTable">INVITE</StyledLink>
                </MenuItem>
              </>
            ) : (
              <></>
            )}

            {/* <MenuItem>
              <StyledLink to="/teamTable">JOIN</StyledLink>
            </MenuItem> */}
          </>
        ) : (
          <></>
        )}

        <MenuItem
          onClick={handleLogout}
          style={{
            color: "#445664",
          }}>
          LOGOUT
        </MenuItem>
      </Menu>
      <Card>
        <StyledLink to="/home">
          <h1
            style={{
              textAlign: "center",
              // fontFamily: "HakgyoansimJiugaeR",
              fontSize: "40px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "black",
            }}>
            축구왕
          </h1>
        </StyledLink>

        {children}
      </Card>
    </PageContainer>
  );
};

export default Layout;
