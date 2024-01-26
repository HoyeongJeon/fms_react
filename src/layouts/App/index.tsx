import React, { useEffect } from 'react';
import axios from 'axios';

import { Link, useNavigate } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import fetcher from 'utils/fetcher';
import { useTeamStore } from 'store/teamStore';
import { useUserStore } from 'store/userStore';
import { BsEmojiSunglasses } from 'react-icons/bs';
import { useProfileStore } from 'store/profileStore';
import useAuthStore from 'store/useAuthStore';
import { Card, Menu, MenuItem, PageContainer, ProfileSection, StyledLink } from './styles';
import { Typography } from 'antd';

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
        `http://localhost:${process.env.REACT_APP_SERVER_PORT || 3000}/api/users/me`,
        fetcher
        // { dedupingInterval: 1000 * 60 * 60 * 24 }
    );
    const { setTeamId } = useTeamStore();
    const { id: userId, setUser } = useUserStore();
    const { logout } = useAuthStore();
    const { setProfile, id: profileId, resetProfile } = useProfileStore();
    const navigate = useNavigate();
    useEffect(() => {
        if (data) {
            resetProfile();
            setUser(data.data);
            setTeamId(data.data.teamId);
        }
        if (data?.data.profile) {
            setProfile(data.data.profile);
        }
    }, [data]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <PageContainer>
            <Menu>
                <MenuItem>
                    <StyledLink to="/home">HOME</StyledLink>
                </MenuItem>
                <MenuItem>
                    <StyledLink to="/team">TEAM</StyledLink>
                </MenuItem>
                <MenuItem>
                    <StyledLink to="/player">PLAYER</StyledLink>
                </MenuItem>
                <MenuItem>
                    <StyledLink to="/strategy">STRATEGY</StyledLink>
                </MenuItem>
                <MenuItem>
                    <StyledLink to={profileId ? `/profile/${profileId}` : `/profile/${userId}/register`}>
                        MY PROFILE
                    </StyledLink>
                </MenuItem>
                <MenuItem
                    onClick={handleLogout}
                    style={{
                        color: '#445664',
                    }}
                >
                    LOGOUT
                </MenuItem>
            </Menu>
            <Card>
                <h2>
                    <StyledLink to="/home">Football Management System (FMS) ⚽🔥</StyledLink>
                </h2>
                {/* <StyledLink
          to={
            profileId ? `/profile/${profileId}` : `/profile/${userId}/register`
          }
        >
          <BsEmojiSunglasses /> Profile
        </StyledLink> */}

                {children}
            </Card>
        </PageContainer>
    );
};

export default Layout;
