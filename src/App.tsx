import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Home from "pages/Home";
import Calendar from "pages/Calendar/index";
import Team from "pages/Team";
import Player from "pages/Player";
import Strategy from "pages/Strategy";
import AdminTeams from "pages/AdminTeams";
import AdminUsers from "pages/AdminUsers";
import TeamTable from "pages/TeamTable";
import MemberTable from "pages/memberTable";
import Match from "pages/match";
import EditProfile from "pages/RegisterProfile";
import Profile from "pages/Profile";
import RegisterProfile from "pages/RegisterProfile";
import useAuthStore from "store/useAuthStore";
import { ReactNode, useEffect } from "react";
import KakaoSuccess from "pages/KakaoSuccess";
import MatchBook from "pages/match/book";
import MatchResult from "pages/MatchResult";
import InputMatchResult from "pages/InputMatchResult";
import InputMatchResultDetail from "pages/InputMatchResultDetail";
import MatchPreview from "pages/MatchPreview";
import MatchReview from "pages/MatchReview";
import MatchCalendar from "pages/match/calendar";
import Formation from "pages/match/formation";
import CreateTeam from "pages/CreateTeam";
import TeamDetail from "pages/TeamDetail";
import MemberDetail from "pages/memberDetail";
import PlayerStatistics from "pages/playerStat";
import { useTeamStore } from "store/teamStore";
import ResetPassword from "pages/resetPassword";
import SendCode from "pages/sendCode";
import HomePreview from "pages/HomePreview";

interface ProtectedRouteProps {
  children: ReactNode;
}

const App = () => {
  const { isLoggedIn } = useAuthStore();

  // const {isStaff} = useAuthStore();
  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
      if (isLoggedIn) {
        navigate("/home");
      }
    }, [isLoggedIn, navigate]);

    return <>{children}</>;
  };

  return (
    <Routes>
      {/* 로그인 안해도 접근 가능한 url */}
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
      {/* 미리보기 페이지 */}
      <Route path="/preview/home" element={<HomePreview />} />
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
          <Route
            path="/profile/:userId/register"
            element={<RegisterProfile />}
          />
          <Route path="/memberDetail" element={<MemberDetail />} />
          {/* <Route path="/api/auth/kakao/callback" element={<KakaoCallback />} /> */}
          <Route path="/match" element={<Match />} />
          <Route path="/match/:matchId/result" element={<MatchResult />} />
          <Route path="/match/:matchId/input" element={<InputMatchResult />} />
          <Route
            path="/match/:matchId/input/detail"
            element={<InputMatchResultDetail />}
          />
          <Route
            path="/match/:matchId/preview"
            element={<MatchPreview />}
          ></Route>
          <Route
            path="/match/:matchId/review"
            element={<MatchReview />}
          ></Route>

          <Route path="/match/book" element={<MatchBook />} />
          <Route path="/match/calendar" element={<MatchCalendar />} />
          <Route path="/match/formation" element={<Formation />} />
          {/* 어드민 용 페이지 */}
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/teams" element={<AdminTeams />} />
          <Route path="/playerStat" element={<PlayerStatistics />} />
          <Route path="/teamTable" element={<TeamTable />} />
          <Route path="/memberTable" element={<MemberTable />} />
          {/* <Route path="/formation " element={<Formation />} /> */}
          {/* <Route path="/*" element={<NotFound />} /> */}
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
