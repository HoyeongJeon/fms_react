import Layout from "layouts/App";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ScoreboardContainer,
  TeamBadge,
  TeamLogo,
  TeamsContainer,
} from "pages/MatchResult/styles";
import { Typography, Button, Flex } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "utils/axios";
import useSWR from "swr";
import fetcher from "utils/fetcher";
import { match } from "assert";
import dayjs from "dayjs";
import { useMemberStore } from "store/memberStore";
const { Title, Text, Link } = Typography;

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
  const [matchDate, setMatchDate] = useState<Date | null>(null);
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
  console.log(awayPresignedURL);
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
      })
      .catch((err) => {
        console.error(err);
      });
  }, [matchId]);

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
    navigate(`/match/${matchId}/input`, {
      state: { matchDate: matchDate?.toISOString() },
    });
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
          const matchDateTime = new Date(
            res.data.data.date + "T" + res.data.data.time
          );
          setMatchDate(matchDateTime);

          setSoccerFieldId(res.data.data.soccer_field_id);
          setHomeTeamId(res.data.data.home_team_id);
          setAwayTeamId(res.data.data.away_team_id);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [matchId]);
  const { isStaff } = useMemberStore();

  const [isMemberStaff, setIsMemberStaff] = useState(false);

  useEffect(() => {
    setIsMemberStaff(isStaff);
  }, [isStaff]);
  const isFutureMatch = () => {
    if (!matchDate || isStaff) return false; // matchDate가 설정되지 않았으면 false 반환

    return matchDate > new Date(); // 현재 날짜와 비교
  };

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
        console.error(err);
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
        console.error(err);
      });
  }, [homeTeamId, awayTeamId]);

  const handleReview = () => {
    navigate("/match/result", { state: { matchId } });
  };

  return (
    <Layout>
      <ScoreboardContainer>
        <Title level={3}>
          {matchDate instanceof Date
            ? dayjs(matchDate).format("YYYY-MM-DD")
            : "Loading..."}
        </Title>
        <TeamsContainer>
          <TeamBadge>
            <TeamLogo src={homePresignedURL} alt="홈 팀 로고" />
            <div>{homeTeam.name}</div>
            <Text type="secondary">
              {matchInfo.home.result.W}승 {matchInfo.home.result.D}무{" "}
              {matchInfo.home.result.L}패
            </Text>
            <br />
            <div>
              <Text style={{ color: "black", fontWeight: "lighter" }}>
                평균득점
                <span
                  style={{
                    color: "#91D0F1",
                    fontWeight: "bold",
                  }}
                >
                  {(matchInfo.home.goal === 0
                    ? 0
                    : matchInfo.home.goal /
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
            <TeamLogo src={awayPresignedURL} alt="어웨이 팀 로고" />
            <div>{awayTeam.name}</div>
            <Text type="secondary">
              {matchInfo.away.result.W}승 {matchInfo.away.result.D}무{" "}
              {matchInfo.away.result.L}패
            </Text>
            <br />
            <div>
              <Text style={{ color: "black", fontWeight: "lighter" }}>
                평균득점
                <span
                  style={{
                    color: "#BF9394",
                    fontWeight: "bold",
                  }}
                >
                  {(matchInfo.away.goal === 0
                    ? 0
                    : matchInfo.away.goal /
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
            <Button
              onClick={handleNext}
              disabled={isFutureMatch() || !isMemberStaff}
            >
              경기 종료
            </Button>
          )
        }
      </ScoreboardContainer>
    </Layout>
  );
};

export default MatchPreview;
