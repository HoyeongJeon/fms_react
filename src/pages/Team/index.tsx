import axios from "axios";
import MyResponsiveLine, {
  MyResponsiveLineType,
} from "components/graph/MyResponsiveLine";
import MyResponsiveRadar, {
  MyResponsiveRadarType,
} from "components/graph/MyResponsiveRadar";
import ImageView from "components/image/ImageView";
import PlaneTable from "components/table/PlaneTable";
import DlText from "components/text/DlText";
import TitleText from "components/text/TitleText";
import Layout from "layouts/App";
import { ScoreboardContainer } from "pages/MatchResult/styles";
import { useEffect, useState } from "react";
import { Card, CardGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTeamStore } from "store/teamStore";
import styled from "styled-components";
import "./team.css";
import useSWR from "swr";
import fetcher from "utils/fetcher";
import MyResponsivePie, {
  MyResponsivePieType,
} from "components/graph/MyResponsePie";

const Button = styled.button`
  padding: 10px 20px;
  min-width: 150px; // 버튼의 최소 너비 설정
  border: none;
  border-radius: 20px;
  background-color: #000;
  color: #fff;
  cursor: pointer;
  font-size: 1rem; // 폰트 크기 조정
  margin: 0 5px; // 버튼 사이의 간격 조정

  &:hover {
    background-color: #555;
  }

  &:active {
    transform: scale(0.98);
  }
`;

interface TeamDetailType {
  id: string;
  createdAt: Date;
  name: string;
  description: string;
  imageUUID: string;
  isMixedGender: boolean;
  gender: string;
  creator: {
    id: number;
    email: string;
    name: string;
  };
  location: {
    id: number;
    state: string;
    city: string;
    district: string;
    address: string;
  };
}

export interface TeamStatsType {
  wins: number;
  loses: number;
  draws: number;
  totalGames: number;
  goals: number;
  conceded: number;
}

export interface MemberListType {
  id: number;
  isStaff: boolean;
  joinDate: Date;
  profile: {
    preferredPosition: string;
    imageUrl: string;
    age: number;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const Team = () => {
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [temaData, setTeamData] = useState<TeamDetailType | null>(null);
  const { teamId } = useTeamStore();
  const [memberList, setMemberList] = useState<MemberListType[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStatsType>();
  const navigate = useNavigate();

  const test2: MyResponsiveRadarType = {
    data: [
      {
        stats: "골",
        myTeam: 44,
        avgTeam: 66,
      },
      {
        stats: "실점",
        myTeam: 91,
        avgTeam: 66,
      },
      {
        stats: "무실점",
        myTeam: 91,
        avgTeam: 66,
      },
    ],
  };

  const test3: MyResponsiveLineType = {
    data: [
      {
        id: "japan",
        data: [
          {
            x: "1월",
            y: 3,
          },
          {
            x: "2월",
            y: 2,
          },
          {
            x: "3월",
            y: 5,
          },
          {
            x: "4월",
            y: 6,
          },
          {
            x: "5월",
            y: 5,
          },
          {
            x: "6월",
            y: 5,
          },
          {
            x: "7월",
            y: 5,
          },
          {
            x: "8월",
            y: 5,
          },
          {
            x: "9월",
            y: 5,
          },
          {
            x: "10월",
            y: 5,
          },
          {
            x: "11월",
            y: 5,
          },
          {
            x: "12월",
            y: 5,
          },
        ],
      },
    ],
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!teamId) {
      alert("정상적이지 않은 접근입니다. 로그인을 다시 해주세요");
      navigate("/login");
      return;
    }

    // 구단주 체크를 수행하는 함수
    const checkIfIsCreator = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}:${
            process.env.REACT_APP_SERVER_PORT || 3000
          }/api/match/creator`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Bearer 토큰 추가
            },
          }
        );
        const creatorId = response.data?.data[0]?.id;
        setIsCreator(!!creatorId); // creatorId가 존재하면 구단주로 간주
        setLoading(false); // 데이터 로딩 완료
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        setLoading(false); // 데이터 로딩 실패
      }
    };

    const getTeam = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}:${
            process.env.REACT_APP_SERVER_PORT || 3000
          }/api/team/${teamId}`,
          {
            params: {
              teamId,
            },
          }
        );

        if (!response) {
          alert("일치하는 데이터가 없습니다");
        }

        setTeamData(response.data.team);
      } catch (err) {
        alert(err);
      }
    };

    const getMemberList = async () => {
      const members = await axios.get<MemberListType[]>(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/team/${teamId}/members`
      );

      return members;
    };

    const getTemaStats = async () => {
      const getStats = await axios.get<TeamStatsType>(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/statistics/${teamId}`,
        {
          params: {
            teamId,
          },
        }
      );

      setTeamStats(getStats.data);
      console.log(teamStats?.wins);
    };

    const loadPage = async () => {
      if (teamId) {
        await getTeam();
        await checkIfIsCreator();
        const getMembers = await getMemberList();
        await getTemaStats();
        setMemberList(getMembers.data);
      }
    };

    loadPage(); // 데이터를 불러오는 함수 호출
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <Layout>
      <div>Team</div>
      <p>일단 팀이 없으면 여기로 못들어옴</p>
      <p>본인이 속해있는 팀 정보가 나와야함</p>
      <ScoreboardContainer>
        <Card className="card-div">
          <div className="team-info-preview">
            <ImageView />
            <div className="team-div">
              <div className="team-child-div">
                {temaData && <TitleText title={temaData.name} />}
                {temaData && (
                  <DlText
                    title="감독"
                    content={temaData.creator.name}
                    className="team-dl"
                  />
                )}
                {temaData && (
                  <DlText
                    title="연고지"
                    content={`${temaData.location.state} ${temaData.location.city}`}
                  />
                )}
              </div>
              <div>
                <div className="team-div">
                  <DlText
                    title="승"
                    content={teamStats?.wins ? teamStats?.wins : 0}
                    className="team-dl"
                  />
                  <DlText
                    title="무"
                    content={teamStats?.draws ? teamStats?.draws : 0}
                    className="team-dl"
                  />
                  <DlText
                    title="패"
                    content={teamStats?.loses ? teamStats?.loses : 0}
                    className="team-dl"
                  />
                  <DlText title="승률" data={teamStats} className="team-dl" />
                </div>
                <div className="team-div">
                  <DlText
                    title="득점"
                    content={teamStats?.goals ? teamStats?.goals : 0}
                    className="team-dl"
                  />
                  <DlText
                    title="실점"
                    content={teamStats?.conceded ? teamStats?.conceded : 0}
                    className="team-dl"
                  />
                  <DlText
                    title="경기"
                    content={teamStats?.totalGames ? teamStats?.totalGames : 0}
                    className="team-dl"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card className="card-div">
          <TitleText title="시즌통계" />
          <div className="team-info-graph">
            <MyResponsiveRadar data={test2.data}></MyResponsiveRadar>
            <MyResponsiveRadar data={test2.data}></MyResponsiveRadar>
            {/* <MyResponsiveLine data={test3.data}></MyResponsiveLine> */}
          </div>
        </Card>
        <Card className="card-div">
          <TitleText title="탑 플레이어" />
          <CardGroup>
            <Card className="team-card">
              <p className="card-p-title">득점</p>
              <p>1</p>
              <Card.Img
                variant="top"
                src="https://img1.daumcdn.net/thumb/S200x200/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F908372.jpg&scode=default_face_profile_big_p"
              />
              <Card.Body>
                <Card.Text className="card-p-text">2. 래시포드</Card.Text>
                <Card.Text className="card-p-text">3. 페르난데스</Card.Text>
              </Card.Body>
            </Card>
            <Card className="team-card">
              <p className="card-p-title">도움</p>
              <p>1</p>
              <Card.Img
                variant="top"
                src="https://img1.daumcdn.net/thumb/S200x200/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F288205.jpg&scode=default_face_profile_big_p"
              />
              <Card.Body>
                <Card.Text className="card-p-text">2. 래시포드</Card.Text>
                <Card.Text className="card-p-text">3. 페르난데스</Card.Text>
              </Card.Body>
            </Card>
            <Card className="team-card">
              <p className="card-p-title">공격P</p>
              <p>1</p>
              <Card.Img
                variant="top"
                src="https://img1.daumcdn.net/thumb/S76x76/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F903830.jpg&scode=default_face_profile_big_p"
              />
              <Card.Body>
                <Card.Text className="card-p-text">2. 래시포드</Card.Text>
                <Card.Text className="card-p-text">3. 페르난데스</Card.Text>
              </Card.Body>
            </Card>
            <Card className="team-card">
              <p className="card-p-title">출전수</p>
              <p>1</p>
              <Card.Img
                variant="top"
                src="https://img1.daumcdn.net/thumb/S76x76/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F772389.jpg&scode=default_face_profile_big_p"
              />
              <Card.Body>
                <Card.Text>
                  <Card.Text className="card-p-text">2. 래시포드</Card.Text>
                  <Card.Text className="card-p-text">3. 페르난데스</Card.Text>
                </Card.Text>
              </Card.Body>
            </Card>
            <Card className="team-card">
              <p className="card-p-title">세이브</p>
              <p>1</p>
              <Card.Img
                variant="top"
                src="https://img1.daumcdn.net/thumb/S76x76/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F772389.jpg&scode=default_face_profile_big_p"
              />
              <Card.Body>
                <Card.Text>
                  <Card.Text className="card-p-text">2. 래시포드</Card.Text>
                  <Card.Text className="card-p-text">3. 페르난데스</Card.Text>
                </Card.Text>
              </Card.Body>
            </Card>
          </CardGroup>
        </Card>
        <Card className="card-div">
          {memberList && <PlaneTable data={memberList} />}
        </Card>
      </ScoreboardContainer>
      <Button onClick={() => navigate("/match/calendar")}>경기 일정</Button>
      <br />
      {/* 데이터 로딩 중이면 로딩 메시지를 표시 */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        /* 구단주일 경우에만 항목 표시 */
        isCreator && (
          <>
            <Button onClick={() => navigate("/match")}>경기 예약</Button>
            <p>구단주만 보이는 버튼</p>
          </>
        )
      )}
    </Layout>
  );
};

export default Team;
