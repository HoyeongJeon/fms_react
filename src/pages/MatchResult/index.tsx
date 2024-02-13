import React, { useEffect, useState } from "react";
import Layout from "layouts/App";

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  NextButton,
  Score,
  ScoreInput,
  ScoreboardContainer,
  TeamBadge,
  TeamLogo,
  TeamsContainer,
  Title,
} from "./styles";
import ComparisonBarChart from "components/CustomBarChart";
import { Button } from "antd";
import { useTeamStore } from "store/teamStore";
import useSWR from "swr";
import fetcher from "utils/fetcher";
import axios from "axios";
import { BASE_URL } from "utils/axios";

// 데이터 형식
// const mockData = [
//   { label: "goal", home: 2, away: 1 },
//   { label: "passes", home: 5, away: 6 },
//   { label: "freeKick", home: 2, away: 5 },
//   { label: "penaltyKick", home: 0, away: 0 },
//   { label: "yellowCards", home: 5, away: 2 },
//   { label: "redCards", home: 0, away: 0 },
//   { label: "saves", home: 8, away: 12 },
// ];

type TeamInfo = {
  goals: any;
  corner_kick: number;
  free_kick: number;
  penalty_kick: number;
  passes: number;
  saves: any;
  yellow_cards: any;
  red_cards: any;
};

type MatchInfo = {
  counted_goals: number;
  counted_red_cards: number;
  counted_yellow_cards: number;
  counted_saves: number;
  free_kick: number;
  penalty_kick: number;
  passes: number;
};

const MatchResult = () => {
  // matchId를 받아서 그 경기에 출전한 home, away 팀의 정보를 가져온다.

  // home away 정보를 통해 , img, teamName을 가져온다.

  // const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { matchId } = location.state || {};
  const { teamId } = useTeamStore();
  const [homeTeamId, setHomeTeamId] = useState();
  const [awayTeamId, setAwayTeamId] = useState();
  const [homeTeamImageUUID, setHomeTeamImageUUID] = useState();
  const [awayTeamImageUUID, setAwayTeamImageUUID] = useState();
  const [homeTeamInfo, setHomeTeamInfo] = useState<TeamInfo>();
  const [home, setHome] = useState<MatchInfo>();
  const [away, setAway] = useState<MatchInfo>();

  const { data: matchResult } = useSWR(
    `/match/${matchId}/result/team/${teamId}`,
    fetcher
  );

  const { data: awayTeamResult } = useSWR(
    `/match/${matchId}/result/team/${awayTeamId}`,
    fetcher
  );

  const { data: homeTeam } = useSWR(`/team/${homeTeamId}`, fetcher);
  const { data: awayTeam } = useSWR(`/team/${awayTeamId}`, fetcher);
  const { data: homeTeamImage } = useSWR(
    `/image/${homeTeamImageUUID}`,
    fetcher
  );
  const { data: awayTeamImage } = useSWR(
    `/image/${awayTeamImageUUID}`,
    fetcher
  );

  useEffect(() => {
    if (matchResult) {
      setHomeTeamId(matchResult.data.match.home_team_id);
      setAwayTeamId(matchResult.data.match.away_team_id);
      setHomeTeamInfo(matchResult.data);
    }
  }, [matchResult, setHomeTeamId, setAwayTeamId]);

  useEffect(() => {
    setHomeTeamImageUUID(homeTeam?.team?.imageUUID);
    setAwayTeamImageUUID(awayTeam?.team?.imageUUID);
  }, [homeTeam, awayTeam, setHomeTeamImageUUID, setAwayTeamImageUUID]);

  // 첫 화면 로딩 시 match 정보 받아옴
  useEffect(() => {
    axios
      .get(`${BASE_URL}/match/${matchId}/result`)
      .then((res) => {
        setHome(res.data.home);
        setAway(res.data.away);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [matchId, setHome, setAway]);

  const handleNext = () => {
    navigate("/home");
  };

  let data = [
    {
      label: "goal",
      home: home?.counted_goals ?? 0,
      away: away?.counted_goals ?? 0,
    },
    {
      label: "passes",
      home: home?.passes ?? 0,
      away: away?.passes ?? 0,
    },
    {
      label: "freeKick",
      home: home?.free_kick ?? 0,
      away: away?.free_kick ?? 0,
    },
    {
      label: "penaltyKick",
      home: home?.penalty_kick ?? 0,
      away: away?.penalty_kick ?? 0,
    },
    {
      // 여기 수정 필요 Arryay로 받아옴
      label: "yellowCards",
      home: home?.counted_yellow_cards ?? 0,
      away: away?.counted_yellow_cards ?? 0,
    },
    {
      // 여기 수정 필요 Arryay로 받아옴
      label: "redCards",
      home: home?.counted_red_cards ?? 0,
      away: away?.counted_red_cards ?? 0,
    },
    {
      // 여기 수정 필요 Arryay로 받아옴
      label: "saves",
      home: home?.counted_saves ?? 0,
      away: away?.counted_saves ?? 0,
    },
  ];

  return (
    <Layout>
      <ScoreboardContainer>
        <Title>{matchResult?.data.match.date}</Title>
        <TeamsContainer>
          <TeamBadge>
            <TeamLogo src={homeTeamImage} alt="홈 팀 로고" />
            <div>{homeTeam?.team.name}</div>
          </TeamBadge>

          <div>
            <Score>{home?.counted_goals ?? 0}</Score>:
            <Score>{away?.counted_goals ?? 0}</Score>
          </div>

          <TeamBadge>
            <TeamLogo src={awayTeamImage} alt="어웨이 팀 로고" />
            <div>{awayTeam?.team.name}</div>
          </TeamBadge>
        </TeamsContainer>
        <Button onClick={handleNext}>Next</Button>
        <ComparisonBarChart data={data} />
      </ScoreboardContainer>
    </Layout>
  );
};

export default MatchResult;
