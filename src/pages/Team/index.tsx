import axios from 'axios';
import { MyResponsiveLineType } from 'components/graph/MyResponsiveLine';
import MyResponsiveRadar, { MyResponsiveRadarType } from 'components/graph/MyResponsiveRadar';
import ImageView from 'components/image/ImageView';
import PlaneTable from 'components/table/PlaneTable';
import DlText from 'components/text/DlText';
import TitleText from 'components/text/TitleText';
import Layout from 'layouts/App';
import { ScoreboardContainer } from 'pages/MatchResult/styles';
import { useEffect, useState } from 'react';
import { Card, CardGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTeamStore } from 'store/teamStore';
import styled from 'styled-components';
import './team.css';

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

interface TopPlayerType {
    topGoals: Array<{
        teamId: number;
        memberId: number;
        userName: string;
        totalGoals: number;
    }>;

    topAssists: Array<{
        teamId: number;
        memberId: number;
        userName: string;
        totalAssists: number;
    }>;

    topJoining: Array<{
        teamId: number;
        memberId: number;
        userName: string;
        joining: number;
    }>;

    topSave: Array<{
        teamId: number;
        memberId: number;
        userName: string;
        totalSave: number;
    }>;

    topAttactPoint: Array<{
        teamId: number;
        memberId: number;
        userName: string;
        attactPoint: number;
    }>;
}

export interface TeamStatsType {
    wins: number;
    loses: number;
    draws: number;
    totalGames: number;
    goals: number;
    conceded: number;
    cleanSheet: number;
    assists: number;
    otherTeam: {
        totalGoals: number;
        totalAssists: number;
        totalCleanSheet: number;
    };
}

export interface PlayersType {
    players: Array<{
        memberId: number;
        userName: string;
        image: string | null;
        totalGames: number;
        totalGoals: number;
        totalAssists: number;
        attactPoint: number;
        totalYellowCards: number;
        totalRedCards: number;
        totalÇleanSheet: number;
        totalSave: number;
    }>;
}

const Team = () => {
    const [isCreator, setIsCreator] = useState(false);
    const [loading, setLoading] = useState(true);
    const [temaData, setTeamData] = useState<TeamDetailType | null>(null);
    const { teamId } = useTeamStore();
    const [players, setPlayers] = useState<PlayersType>();
    const [teamStats, setTeamStats] = useState<TeamStatsType>();
    const [teamGraphData, setTeamGraphData] = useState<MyResponsiveRadarType>({ data: [] });
    const [topPlaeyr, setTopPlayer] = useState<TopPlayerType>();
    const [validationMsg, setValidationMsg] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');

        if (!teamId) {
            alert('정상적이지 않은 접근입니다. 로그인을 다시 해주세요');
            navigate('/login');
            return;
        }

        // 구단주 체크를 수행하는 함수
        const checkIfIsCreator = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:${process.env.REACT_APP_SERVER_PORT || 3000}/api/match/creator`,
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
                console.error('데이터 불러오기 실패:', error);
                setLoading(false); // 데이터 로딩 실패
            }
        };

        const getTeam = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:${process.env.REACT_APP_SERVER_PORT || 3000}/api/team/${teamId}`,
                    {
                        params: {
                            teamId,
                        },
                    }
                );

                if (!response) {
                    alert('일치하는 데이터가 없습니다');
                }

                setTeamData(response.data.team);
            } catch (err) {
                alert(err);
            }
        };

        const getMemberList = async () => {
            const players = await axios.get<PlayersType>(
                `http://localhost:${process.env.REACT_APP_SERVER_PORT || 3000}/api/team/${teamId}/players`
            );

            setPlayers(players.data);
        };

        const getTeamStats = async () => {
            const getStats = await axios.get<TeamStatsType>(
                `http://localhost:${process.env.REACT_APP_SERVER_PORT || 3000}/api/statistics/${teamId}`,
                {
                    params: {
                        teamId,
                    },
                }
            );

            setTeamStats(getStats.data);
        };

        const getTopPlayer = async () => {
            const getTopMembers = await axios.get<TopPlayerType>(
                `http://localhost:${process.env.REACT_APP_SERVER_PORT || 3000}/api/statistics/${teamId}/top-player`,
                {
                    params: {
                        teamId,
                    },
                }
            );

            setTopPlayer(getTopMembers.data);
        };

        const loadPage = async () => {
            if (teamId) {
                await getTeam();
                await checkIfIsCreator();
                const getMembers = await getMemberList();
                await getTeamStats();
                await getTopPlayer();
            }
        };

        loadPage(); // 데이터를 불러오는 함수 호출
    }, []);

    useEffect(() => {
        setTeamGraphData({
            data: [
                { stats: '골', myTeam: teamStats?.goals ?? 0, avgTeam: teamStats?.otherTeam.totalGoals ?? 0 },
                {
                    stats: '어시스트',
                    myTeam: teamStats?.assists ?? 0,
                    avgTeam: teamStats?.otherTeam.totalAssists ?? 0,
                },
                {
                    stats: '무실점',
                    myTeam: teamStats?.cleanSheet ?? 0,
                    avgTeam: teamStats?.otherTeam.totalCleanSheet ?? 0,
                },
            ],
        });
    }, [teamStats]);

    useEffect(() => {
        if (teamStats?.totalGames === 0) {
            setValidationMsg('경기 통계를 위한 게임수가 부족합니다.');
        } else if (!teamStats?.otherTeam) {
            setValidationMsg('경기 통계를 위한 다른팀들의 통계가 부족합니다.');
        }
    }, [teamStats?.totalGames]);

    // useEffect(() => {
    //     const normalizedData = teamGraphData.data.map((item: any) => {
    //         const maxValue = Math.max(item.myTeam, item.avgTeam);

    //         return {
    //             stats: item.stats,
    //             myTeam: (item.myTeam / maxValue) * 100,
    //             avgTeam: (item.avgTeam / maxValue) * 100,
    //         };
    //     });
    // }, [teamGraphData]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    return (
        <Layout>
            <ScoreboardContainer>
                <Card className="card-div">
                    <div className="team-info-preview">
                        <ImageView />
                        <div className="team-div">
                            <div className="team-child-div">
                                {temaData && <TitleText title={temaData.name} />}
                                {temaData && (
                                    <DlText title="감독" content={temaData.creator.name} className="team-dl" />
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
                {validationMsg ?? <p>{teamStats?.totalGames}게임 통계입니다.</p>}
                <Card className="card-div">
                    <TitleText title="시즌통계" />
                    <div className="team-info-graph">
                        <MyResponsiveRadar data={teamGraphData}></MyResponsiveRadar>
                    </div>
                </Card>
                <Card className="card-div">
                    <TitleText title="탑 플레이어" />
                    <CardGroup>
                        <Card className="team-card">
                            <p className="card-p-title">득점</p>
                            {topPlaeyr?.topGoals.map((item, index) =>
                                index === 0 ? (
                                    <div>
                                        <p>
                                            {index + 1}. {item.userName} {item.totalGoals}득점
                                        </p>
                                        <Card.Img
                                            variant="top"
                                            src="https://img1.daumcdn.net/thumb/S200x200/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F908372.jpg&scode=default_face_profile_big_p"
                                        />
                                    </div>
                                ) : (
                                    <Card.Body>
                                        <Card.Text className="card-p-text">
                                            {index + 1}. {item.userName} {item.totalGoals}득점
                                        </Card.Text>
                                    </Card.Body>
                                )
                            )}
                        </Card>
                        <Card className="team-card">
                            <p className="card-p-title">도움</p>
                            {topPlaeyr?.topAssists.map((item, index) =>
                                index === 0 ? (
                                    <div>
                                        <p>
                                            {index + 1}. {item.userName} {item.totalAssists}도움
                                        </p>
                                        <Card.Img
                                            variant="top"
                                            src="https://img1.daumcdn.net/thumb/S200x200/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F908372.jpg&scode=default_face_profile_big_p"
                                        />
                                    </div>
                                ) : (
                                    <Card.Body>
                                        <Card.Text className="card-p-text">
                                            {index + 1}. {item.userName} {item.totalAssists}도움
                                        </Card.Text>
                                    </Card.Body>
                                )
                            )}
                        </Card>
                        <Card className="team-card">
                            <p className="card-p-title">공격P</p>
                            {topPlaeyr?.topAttactPoint.map((item, index) =>
                                index === 0 ? (
                                    <div>
                                        <p>
                                            {index + 1}. {item.userName} {item.attactPoint}공격P
                                        </p>
                                        <Card.Img
                                            variant="top"
                                            src="https://img1.daumcdn.net/thumb/S200x200/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F908372.jpg&scode=default_face_profile_big_p"
                                        />
                                    </div>
                                ) : (
                                    <Card.Body>
                                        <Card.Text className="card-p-text">
                                            {index + 1}. {item.userName} {item.attactPoint}공격P
                                        </Card.Text>
                                    </Card.Body>
                                )
                            )}
                        </Card>
                        <Card className="team-card">
                            <p className="card-p-title">출전수</p>
                            {topPlaeyr?.topJoining.map((item, index) =>
                                index === 0 ? (
                                    <div>
                                        <p>
                                            {index + 1}. {item.userName} {item.joining}경기
                                        </p>
                                        <Card.Img
                                            variant="top"
                                            src="https://img1.daumcdn.net/thumb/S200x200/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F908372.jpg&scode=default_face_profile_big_p"
                                        />
                                    </div>
                                ) : (
                                    <Card.Body>
                                        <Card.Text className="card-p-text">
                                            {index + 1}. {item.userName} {item.joining}경기
                                        </Card.Text>
                                    </Card.Body>
                                )
                            )}
                        </Card>
                        <Card className="team-card">
                            <p className="card-p-title">세이브</p>
                            {topPlaeyr?.topSave.map((item, index) =>
                                index === 0 ? (
                                    <div>
                                        <p>
                                            {index + 1}. {item.userName} {item.totalSave}세이브
                                        </p>
                                        <Card.Img
                                            variant="top"
                                            src="https://img1.daumcdn.net/thumb/S200x200/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F908372.jpg&scode=default_face_profile_big_p"
                                        />
                                    </div>
                                ) : (
                                    <Card.Body>
                                        <Card.Text className="card-p-text">
                                            {index + 1}. {item.userName} {item.totalSave}세이브
                                        </Card.Text>
                                    </Card.Body>
                                )
                            )}
                        </Card>
                    </CardGroup>
                </Card>
                <Card className="card-div">{players && <PlaneTable data={players} />}</Card>
            </ScoreboardContainer>
            <Button onClick={() => navigate('/match/calendar')}>경기 일정</Button>
            <br />
            {/* 데이터 로딩 중이면 로딩 메시지를 표시 */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                /* 구단주일 경우에만 항목 표시 */
                isCreator && (
                    <>
                        <Button onClick={() => navigate('/match')}>경기 예약</Button>
                        <p>구단주만 보이는 버튼</p>
                    </>
                )
            )}
        </Layout>
    );
};

export default Team;
