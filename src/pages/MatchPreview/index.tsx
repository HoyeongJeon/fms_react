import Layout from "layouts/App";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  NextButton,
  ScoreboardContainer,
  TeamBadge,
  TeamLogo,
  TeamsContainer,
} from "pages/MatchResult/styles";
import { Typography, Button, Flex } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "utils/axios";
import { set } from "date-fns";
import useSWR from "swr";
import fetcher from "utils/fetcher";
const { Title, Text, Link } = Typography;

// const Data = {
//   home: {
//     name: "홈팀",
//     result: { L: 4, W: 12, D: 4 },
//     currentResult: "LWWWL",
//     goal: 14,
//   },
//   away: {
//     name: "어웨이팀",
//     result: {
//       L: 6,
//       W: 1,
//       D: 2,
//     },
//     currentResult: "LWWWW",
//     goal: 12,
//   },
// };
type MatchInfo = {
  home: {
    result: {
      L: number;
      W: number;
      D: number;
    };
    goal: number;
  };
  away: {
    result: {
      L: number;
      W: number;
      D: number;
    };
    goal: number;
  };
};

const MatchPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { matchId } = location.state || {};
  const [gameOver, setGameOver] = useState(false);
  const [matchDate, setMatchDate] = useState();
  const [soccerFieldId, setSoccerFieldId] = useState();
  const [homeTeamId, setHomeTeamId] = useState();
  const [awayTeamId, setAwayTeamId] = useState();
  const [homeTeam, setHomeTeam] = useState({
    name: "",
    imageUUID: "",
  });
  const [awayTeam, setAwayTeam] = useState({
    name: "",
    imageUUID: "",
  });
  const now = new Date();
  const { data: homePresignedURL } = useSWR(
    `/image/${homeTeam.imageUUID}`,
    fetcher
  );
  const { data: awayPresignedURL } = useSWR(
    `/image/${awayTeam.imageUUID}`,
    fetcher
  );
  const { data: homeTeamData } = useSWR(`/statistics/${homeTeamId}`, fetcher);
  const { data: awayTeamData } = useSWR(`/statistics/${awayTeamId}`, fetcher);
  const [matchInfo, setMatchInfo] = useState<MatchInfo>({
    home: {
      result: {
        L: 0,
        W: 0,
        D: 0,
      },
      goal: 0,
    },
    away: {
      result: {
        L: 0,
        W: 0,
        D: 0,
      },
      goal: 0,
    },
  });

  // 경기 종료 여부 확인
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    axios
      .get(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/match/${matchId}/result/exist`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Bearer 토큰 추가
          },
        }
      )
      .then((res) => {
        if (res !== undefined) {
          setGameOver(true);
        } else {
          setGameOver(false);
        }
      });
  }, [matchId]);

  // 경기 종료 시 버튼 비활성화, 경기 리뷰 페이지로 이동 버튼 추기

  useEffect(() => {
    if (!homeTeamData || !awayTeamData) return;
    setMatchInfo({
      home: {
        result: {
          L: homeTeamData.loses,
          W: homeTeamData.wins,
          D: homeTeamData.draws,
        },
        goal: homeTeamData.goals,
      },
      away: {
        result: {
          L: awayTeamData.loses,
          W: awayTeamData.wins,
          D: awayTeamData.draws,
        },
        goal: awayTeamData.goals,
      },
    });
  }, [homeTeamData, awayTeamData]);

  const handleNext = () => {
    // 매치 날짜보다 이르면 경기 종료 불가능
    // if (now < matchDate) {
    //   alert("경기가 시작되지 않았습니다.");
    //   return;
    // }
    navigate(`/match/${matchId}/input`, { state: { matchDate } });
  };

  useEffect(() => {
    if (!matchId) {
      navigate("/");
    } else {
      // 매치 정보를 가져와야 함
      const accessToken = localStorage.getItem("accessToken");
      axios
        .get(`${BASE_URL}/match/${matchId}/preview`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        })
        .then((res) => {
          console.log("res.data.data= ", res.data.data);

          const matchDate = new Date(
            res.data.data.date + " " + res.data.data.time
          );

          // if (now > matchDate) {
          //   setGameOver(false);
          // }
          // console.log("now= ", now);
          // console.log("matchDate= ", matchDate);
          // console.log("gameOver= ", gameOver);

          setMatchDate(res.data.data.date);
          setSoccerFieldId(res.data.data.soccer_field_id);
          setHomeTeamId(res.data.data.home_team_id);
          setAwayTeamId(res.data.data.away_team_id);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [matchId]);

  useEffect(() => {
    if (!homeTeamId || !awayTeamId) return;
    const accessToken = localStorage.getItem("accessToken");
    axios
      .get(`${BASE_URL}/team/${homeTeamId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      })
      .then((res) => {
        setHomeTeam(
          Object.assign(homeTeam, {
            name: res.data.team.name,
            imageUUID: res.data.team.imageUUID,
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
    axios
      .get(`${BASE_URL}/team/${awayTeamId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      })
      .then((res) => {
        setAwayTeam(
          Object.assign(awayTeamId, {
            name: res.data.team.name,
            imageUUID: res.data.team.imageUUID,
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, [homeTeamId, awayTeamId]);

  const handleReview = () => {
    navigate("/match/result", { state: { matchId } });
  };

  return (
    <Layout>
      <ScoreboardContainer>
        <Title level={3}>{matchDate}</Title>
        <TeamsContainer>
          <TeamBadge>
            <TeamLogo src={homePresignedURL} alt="홈 팀 로고 넣어야함" />
            <div>{homeTeam.name}</div>
            <Text type="secondary">
              {matchInfo.home.result.W}승 {matchInfo.home.result.D}무{" "}
              {matchInfo.home.result.L}패
            </Text>
            <br />
            {/* {Data.home.currentResult.split("").map((result) => {
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
            })} */}
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
                    matchInfo.home.goal /
                    (matchInfo.home.result.W +
                      matchInfo.home.result.D +
                      matchInfo.home.result.L)
                  ).toFixed(2)}
                </span>
              </Text>
            </div>
          </TeamBadge>
          <Title level={4}>vs</Title>
          <TeamBadge>
            {/* Replace with actual image paths */}
            <TeamLogo src={awayPresignedURL} alt="어웨이 팀 로고 넣어야함" />
            <div>{awayTeam.name}</div>
            <Text type="secondary">
              {matchInfo.away.result.W}승 {matchInfo.away.result.D}무{" "}
              {matchInfo.away.result.L}패
            </Text>
            <br />
            {/* {Data.away.currentResult.split("").map((result) => {
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
            })} */}
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
                    matchInfo.away.goal /
                    (matchInfo.away.result.W +
                      matchInfo.away.result.D +
                      matchInfo.away.result.L)
                  ).toFixed(2)}
                </span>
              </Text>
            </div>
          </TeamBadge>
        </TeamsContainer>
        {
          // 경기 종료 후에는 버튼을 비활성화
          gameOver ? (
            <Button onClick={handleReview}>경기 리뷰 확인</Button>
          ) : (
            <Button onClick={handleNext}>경기 종료</Button>
          )
        }
      </ScoreboardContainer>
    </Layout>
  );
};

export default MatchPreview;
