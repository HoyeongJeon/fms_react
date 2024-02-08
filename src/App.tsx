import React, { ReactNode, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTrail, a } from '@react-spring/web';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Calendar from './pages/Calendar/index';
import Team from './pages/Team';
import Player from './pages/Player';
import Strategy from './pages/Strategy';
import AdminTeams from './pages/AdminTeams';
import AdminUsers from './pages/AdminUsers';
import TeamTable from './pages/TeamTable';
import MemberTable from './pages/memberTable';
import Match from './pages/match';
import EditProfile from './pages/EditProfile';
import Profile from './pages/Profile';
import RegisterProfile from './pages/RegisterProfile';
import useAuthStore from './store/useAuthStore';
import MatchResult from './pages/MatchResult';
import InputMatchResult from './pages/InputMatchResult';
import InputMatchResultDetail from './pages/InputMatchResultDetail';
import MatchPreview from './pages/MatchPreview';
import MatchReview from './pages/MatchReview';
import MatchBook from './pages/match/book';
import MatchCalendar from './pages/match/calendar';
import Formation from './pages/match/formation';
import CreateTeam from './pages/CreateTeam';
import TeamDetail from './pages/TeamDetail';
import MemberDetail from './pages/memberDetail';
import PlayerStatistics from './pages/playerStat';
import ResetPassword from './pages/resetPassword';
import SendCode from './pages/sendCode';
import KakaoSuccess from './pages/KakaoSuccess';
import './styles.module.css';
import HomePreview from 'pages/HomePreview';

const Trail: React.FC<{ open: boolean }> = ({ open }: React.PropsWithChildren<{ open: boolean }>) => {
    const navigate = useNavigate();
    const initialItem = `
    이 세상 
    모든 축구를 
    사랑하는 회원들을 
    위한 공간 ⚽💙`;

    const handleItemClick = () => {
        // 클릭하면 "/"이면 로그인 페이지로 이동
        navigate('/login');
    };

    useEffect(() => {
        const startAnimation = () => {
            var start: number | null = null; // Explicitly define the type
            var element = document.getElementById('box');

            function step(timestamp: number) {
                if (!start) start = timestamp;
                var progress = timestamp - (start as number);

                // Null check for element
                if (element) {
                    element.style.width = Math.min(progress / 10, 200) + 'px';
                    element.style.height = Math.min(progress / 10, 200) + 'px';
                }

                if (progress < 2000 && element) {
                    window.requestAnimationFrame(step);
                }
            }

            window.requestAnimationFrame(step);
        };

        startAnimation();

        // Clean up function (optional)
        return () => {
            // Any cleanup code if needed
        };
    }, []);

    const trail = useTrail(1, {
        config: { mass: 5, tension: 2000, friction: 200 },
        opacity: open ? 1 : 0,
        x: open ? 0 : 20,
        height: open ? 110 : 0,
        from: { opacity: 0, x: 20, height: 0 },
    });

    return (
        <div className="container" style={{ position: 'relative', height: '100vh' }}>
            {trail.map(({ height, ...style }) => (
                <a.div key="initial" className="trailsText" style={style} onClick={handleItemClick}>
                    <a.div
                        className="trailsTextInner"
                        style={{
                            height,
                            display: 'flex',
                            fontSize: '150px',
                            fontWeight: 'bold',
                            fontFamily: "'Gowun Batang', sans-serif",
                        }}
                    >
                        {initialItem}
                    </a.div>
                </a.div>
            ))}
            {/* Box for animation */}
            <div
                id="box"
                className="box"
                style={{
                    background: '#007fff',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    position: 'absolute',
                    transform: 'translateX(-50%)', // Center horizontally
                    zIndex: -2,
                }}
            ></div>
            {/* Background with animation */}
            {/* <div id="background" className="background" style={{
     position: "absolute",
     width: "100%",
     height: "100%",
     background: "linear-gradient(45deg, #F17C58, #E94584, #24AADB, #27DBB1, #FFDC18, #FF3706)",
     backgroundSize: "cover", // Cover the entire screen
     animation: "gradient 16s linear infinite",
     animationDirection: "alternate",
     margin: 0,
     zIndex: -1,
      }}>
      </div> */}
        </div>
    );
};

interface ProtectedRouteProps {
    children: ReactNode;
}

const App: React.FC = () => {
    const { isLoggedIn } = useAuthStore();
    const navigate = useNavigate();
    const [open, set] = useState(true);

    const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
        useEffect(() => {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            if (isLoggedIn) {
                navigate('/home');
            }
        }, [isLoggedIn, navigate]);

        return <>{children}</>;
    };

    const handleItemClick = (item: string) => {
        if (item === '/') {
            // 클릭한 아이템이 "/"이면 로그인 페이지로 이동
            navigate('/login');
        }
        // 다른 경우는 해당 아이템의 경로로 이동
        navigate(item);
    };

    return (
        <Routes>
            {/* 로그인 안해도 접근 가능한 url */}
            <Route path="/home/preview" element={<HomePreview />} />
            <Route path="/" element={<Trail open={open} />} />
            <Route path="/emailCode" element={<SendCode />} />
            <Route path="/password" element={<ResetPassword />} />
            <Route
                path="/login"
                element={
                    <ProtectedRoute>
                        <LogIn />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/signup"
                element={
                    <ProtectedRoute>
                        <SignUp />
                    </ProtectedRoute>
                }
            />
            <Route path="/kakaoSuccess" element={<KakaoSuccess />} />
            {/* ... (로그인 이후에 접근 가능한 라우트들) ... */}
            {isLoggedIn ? (
                <>
                    <Route path="/home" element={<Home />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/team/create" element={<CreateTeam />} />
                    <Route path="/team/:teamId" element={<TeamDetail />} />
                    <Route path="/player" element={<Player />} />
                    <Route path="/strategy" element={<Strategy />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/profile/:userId/edit" element={<EditProfile />} />
                    <Route path="/profile/:userId" element={<Profile />} />
                    <Route path="/profile/:userId/register" element={<RegisterProfile />} />
                    <Route path="/team/:teamId/member/:memberId" element={<MemberDetail />} />
                    <Route path="/match" element={<Match />} />
                    <Route path="/match/:matchId/result" element={<MatchResult />} />
                    <Route path="/match/:matchId/input" element={<InputMatchResult />} />
                    <Route path="/match/:matchId/input/detail" element={<InputMatchResultDetail />} />
                    <Route path="/match/preview" element={<MatchPreview />} />
                    <Route path="/match/:matchId/review" element={<MatchReview />} />
                    <Route path="/match/book" element={<MatchBook />} />
                    <Route path="/match/calendar" element={<MatchCalendar />} />
                    <Route path="/match/formation" element={<Formation />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/teams" element={<AdminTeams />} />
                    <Route path="/playerStat" element={<PlayerStatistics />} />
                    <Route path="/teamTable" element={<TeamTable />} />
                    <Route path="/memberTable" element={<MemberTable />} />
                </>
            ) : (
                <>
                    <Route path="/*" element={<Navigate replace to="/login" />} />
                </>
            )}
        </Routes>
    );
};

export default App;

{
    /* <>
<Route path="/home" element={<Home />} />
<Route path="/team" element={<Team />} />
<Route path="/team/create" element={<CreateTeam />} />
<Route path="/team/:teamId" element={<TeamDetail />} />
<Route path="/player" element={<Player />} />
<Route path="/strategy" element={<Strategy />} />
<Route path="/calendar" element={<Calendar />} />
<Route path="/profile/:userId/edit" element={<EditProfile />} />
<Route path="/profile/:userId" element={<Profile />} />
<Route
  path="/profile/:userId/register"
  element={<RegisterProfile />}
/>
<Route path="/memberDetail" element={<MemberDetail />} />
<Route path="/match" element={<Match />} />
<Route path="/match/:matchId/result" element={<MatchResult />} />
<Route path="/match/:matchId/input" element={<InputMatchResult />} />
<Route
  path="/match/:matchId/input/detail"
  element={<InputMatchResultDetail />}
/>
<Route path="/match/:matchId/preview" element={<MatchPreview />} />
<Route path="/match/:matchId/review" element={<MatchReview />} />
<Route path="/match/book" element={<MatchBook />} />
<Route path="/match/calendar" element={<MatchCalendar />} />
<Route path="/match/formation" element={<Formation />} />
<Route path="/admin/users" element={<AdminUsers />} />
<Route path="/admin/teams" element={<AdminTeams />} />
<Route path="/playerStat" element={<PlayerStatistics />} />
<Route path="/teamTable" element={<TeamTable />} />
<Route path="/memberTable" element={<MemberTable />} />
</> */
}

{
    /* <Route path="/*" element={<Navigate replace to="/login" />} /> */
}
