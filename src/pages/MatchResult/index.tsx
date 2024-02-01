import React, { useState } from "react";
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

const MatchResult = () => {
  // matchId를 받아서 그 경기에 출전한 home, away 팀의 정보를 가져온다.

  // home away 정보를 통해 , img, teamName을 가져온다.

  const { matchId } = useParams();
  const navigate = useNavigate();
  const { teamId } = useTeamStore();

  const { data: matchResult } = useSWR(
    `/match/${matchId}/result/team/${teamId}`,
    fetcher
  );

  console.log("matchResult", matchResult);

  const handleNext = () => {
    navigate("/home");
  };
  return (
    <Layout>
      <ScoreboardContainer>
        <Title>XX년 XX월 XX일 (경기장 이름) MatchID {matchId}</Title>
        <TeamsContainer>
          <TeamBadge>
            <TeamLogo src="" alt="홈 팀 로고 넣어야함" />
            <div>홈 팀 정보 받아와서 이름 넣어야함</div>
          </TeamBadge>

          <div>
            <Score>1</Score>:<Score>2</Score>
          </div>

          <TeamBadge>
            {/* Replace with actual image paths */}
            <TeamLogo src="" alt="어웨이 팀 로고 넣어야함" />
            <div>어웨이 팀 정보 받아와서 이름 넣어야함</div>
          </TeamBadge>
        </TeamsContainer>
        <Button onClick={handleNext}>Next</Button>
        <ComparisonBarChart data={mockData} />
      </ScoreboardContainer>
    </Layout>
  );
};

export default MatchResult;
