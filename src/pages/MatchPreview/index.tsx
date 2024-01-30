import Layout from "layouts/App";
import { useNavigate, useParams } from "react-router-dom";
import {
  NextButton,
  ScoreboardContainer,
  TeamBadge,
  TeamLogo,
  TeamsContainer,
} from "pages/MatchResult/styles";
import { Typography, Button, Flex } from "antd";
const { Title, Text, Link } = Typography;

const Data = {
  home: {
    name: "홈팀",
    result: { L: 4, W: 12, D: 4 },
    currentResult: "LWWWL",
    goal: 14,
  },
  away: {
    name: "어웨이팀",
    result: {
      L: 6,
      W: 1,
      D: 2,
    },
    currentResult: "LWWWW",
    goal: 12,
  },
};

const MatchPreview = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const now = new Date();
  const handleNext = () => {
    // 매치 날짜보다 이르면 경기 종료 불가능
    // if (now < matchDate) {
    //   alert("경기가 시작되지 않았습니다.");
    //   return;
    // }
    navigate(`/match/${matchId}/input`);
  };
  return (
    <Layout>
      <ScoreboardContainer>
        <Title level={3}>XX년 XX월 XX일 (경기장 이름) MatchID {matchId}</Title>
        <TeamsContainer>
          <TeamBadge>
            <TeamLogo src="" alt="홈 팀 로고 넣어야함" />
            <div>{Data.home.name}</div>
            <Text type="secondary">
              {Data.home.result.W}승 {Data.home.result.D}무 {Data.home.result.L}
              패
            </Text>
            <br />
            {Data.home.currentResult.split("").map((result) => {
              let style = {};
              if (result === "W") {
                style = { color: "#91D0F1" };
              } else if (result === "L") {
                style = { color: "#BF9394" };
              } else if (result === "D") {
                style = { color: "#C6C2C1" };
              }

              return (
                <Text type="secondary" style={style}>
                  {result}
                </Text>
              );
            })}
            <div>
              <Text style={{ color: "black", fontWeight: "lighter" }}>
                평균득점
                <span
                  style={{
                    color: "#91D0F1",
                    fontWeight: "bold",
                  }}
                >
                  {(
                    Data.home.goal /
                    (Data.home.result.W +
                      Data.home.result.D +
                      Data.home.result.L)
                  ).toFixed(2)}
                </span>
              </Text>
            </div>
          </TeamBadge>
          <Title level={4}>vs</Title>
          <TeamBadge>
            {/* Replace with actual image paths */}
            <TeamLogo src="" alt="어웨이 팀 로고 넣어야함" />
            <div>{Data.away.name}</div>
            <Text type="secondary">
              {Data.away.result.W}승 {Data.away.result.D}무 {Data.away.result.L}
              패
            </Text>
            <br />
            {Data.away.currentResult.split("").map((result) => {
              let style = {};
              if (result === "W") {
                style = { color: "#91D0F1" };
              } else if (result === "L") {
                style = { color: "#BF9394" };
              } else if (result === "D") {
                style = { color: "#C6C2C1" };
              }

              return (
                <Text type="secondary" style={style}>
                  {result}
                </Text>
              );
            })}
            <div>
              <Text style={{ color: "black", fontWeight: "lighter" }}>
                평균득점
                <span
                  style={{
                    color: "#BF9394",
                    fontWeight: "bold",
                  }}
                >
                  {(
                    Data.away.goal /
                    (Data.away.result.W +
                      Data.away.result.D +
                      Data.away.result.L)
                  ).toFixed(2)}
                </span>
              </Text>
            </div>
          </TeamBadge>
        </TeamsContainer>
        <Button onClick={handleNext}>경기 종료</Button>
      </ScoreboardContainer>
    </Layout>
  );
};

export default MatchPreview;
