import React, { useEffect, useState } from "react";
import Layout from "layouts/App";

import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
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
const mockData = [
  { label: "goal", home: 2, away: 1 },
  { label: "passes", home: 5, away: 6 },
  { label: "freeKick", home: 2, away: 5 },
  { label: "penaltyKick", home: 0, away: 0 },
  { label: "yellowCards", home: 5, away: 2 },
  { label: "redCards", home: 0, away: 0 },
  { label: "saves", home: 8, away: 12 },
];

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

const MatchResult = () => {
  // matchId를 받아서 그 경기에 출전한 home, away 팀의 정보를 가져온다.

  // home away 정보를 통해 , img, teamName을 가져온다.

  const { matchId } = useParams();
  const navigate = useNavigate();
  const { teamId } = useTeamStore();
  const [homeTeamId, setHomeTeamId] = useState();
  const [awayTeamId, setAwayTeamId] = useState();
  const [homeTeamImageUUID, setHomeTeamImageUUID] = useState();
  const [awayTeamImageUUID, setAwayTeamImageUUID] = useState();
  const [homeTeamInfo, setHomeTeamInfo] = useState<TeamInfo | null>();
  const { data: matchResult } = useSWR(
    `/match/${matchId}/result/team/${teamId}`,
    fetcher
  );

  const { data: awayTeamResult } = useSWR(
    `/match/${matchId}/result/team/${awayTeamId}`,
    fetcher
  );

  console.log("awayTeamResult", awayTeamResult);
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

  const handleNext = () => {
    navigate("/home");
  };

  // 여기부터... 골 갯수 확인하기

  // const mockData = [
  //   { label: "goal", home: 2, away: 1 },
  //   { label: "passes", home: 5, away: 6 },
  //   { label: "freeKick", home: 2, away: 5 },
  //   { label: "penaltyKick", home: 0, away: 0 },
  //   { label: "yellowCards", home: 5, away: 2 },
  //   { label: "redCards", home: 0, away: 0 },
  //   { label: "saves", home: 8, away: 12 },
  // ];
  // console.log("homeTeamInfo", homeTeamInfo);
  let data = [
    {
      label: "goal",
      home: homeTeamInfo?.goals.length,
      away: awayTeamResult?.data.goals?.length,
    },
    {
      label: "passes",
      home: homeTeamInfo?.passes,
      away: awayTeamResult?.data.passes,
    },
    {
      label: "freeKick",
      home: homeTeamInfo?.free_kick,
      away: awayTeamResult?.data.free_kick,
    },
    {
      label: "penaltyKick",
      home: homeTeamInfo?.penalty_kick,
      away: awayTeamResult?.data.penalty_kick,
    },
    {
      // 여기 수정 필요 Arryay로 받아옴
      label: "yellowCards",
      home: homeTeamInfo?.yellow_cards.length,
      away: awayTeamResult?.data.yellow_cards.length,
    },
    {
      // 여기 수정 필요 Arryay로 받아옴
      label: "redCards",
      home: homeTeamInfo?.red_cards.length,
      away: awayTeamResult?.data.red_cards.length,
    },
    {
      // 여기 수정 필요 Arryay로 받아옴
      label: "saves",
      home: homeTeamInfo?.saves.length,
      away: awayTeamResult?.data.saves.length,
    },
  ];
  console.log("data", data);
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
            <Score>1</Score>:<Score>2</Score>
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
