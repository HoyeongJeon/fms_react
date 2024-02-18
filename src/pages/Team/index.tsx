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
import MyResponsivePie from 'components/graph/MyResponsePie';
import BasicBars from 'components/graph/BasicBars';

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
        image: string;
    }>;

    topAssists: Array<{
        teamId: number;
        memberId: number;
        userName: string;
        totalAssists: number;
        image: string;
    }>;

    topJoining: Array<{
        teamId: number;
        memberId: number;
        userName: string;
        joining: number;
        image: string;
    }>;

    topSave: Array<{
        teamId: number;
        memberId: number;
        userName: string;
        totalSave: number;
        image: string;
    }>;

    topAttactPoint: Array<{
        teamId: number;
        memberId: number;
        userName: string;
        attactPoint: number;
        image: string;
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

export interface YellowAndRedCardsType {
    yellowAndRedCards: Array<{
        yellow: number;
        red: number;
        created: Date;
    }>;
}

export const getImageUrl = async (url: string) => {
    const getUrl = await axios.get<string>(
        `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT || 3000}/api/image/${url}`,
        {
            params: {
                url,
            },
        }
    );

    return getUrl.data;
};

const Team = () => {
    const [isCreator, setIsCreator] = useState(false);
    const [loading, setLoading] = useState(true);
    const [teamData, setTeamData] = useState<TeamDetailType | null>(null);
    const { teamId } = useTeamStore();
    const [players, setPlayers] = useState<PlayersType>();
    const [teamStats, setTeamStats] = useState<TeamStatsType>();
    const [teamGraphData, setTeamGraphData] = useState<MyResponsiveRadarType>({
        data: [],
    });
    const [topPlaeyr, setTopPlayer] = useState<TopPlayerType>();
    const [validationMsg, setValidationMsg] = useState<string>('');
    const [topGoalsPlayer, setTopGoalsPlayer] = useState<string>('/img/empty_profile_iamge.png');
    const [topGamesPlayer, setTopGamesPlayer] = useState<string>('/img/empty_profile_iamge.png');
    const [topAssistsPlayer, setTopAssistsPlayer] = useState<string>('/img/empty_profile_iamge.png');
    const [topAttactPointPlayer, setAttactPointPlayer] = useState<string>('/img/empty_profile_iamge.png');
    const [topSavePlayer, setTopSavePlayer] = useState<string>('/img/empty_profile_iamge.png');
    const [yellowAndRedCards, setYellowAndRedCards] = useState<YellowAndRedCardsType>();
    const [winRate, setWinRate] = useState(0);
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
                console.error('데이터 불러오기 실패:', error);
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
                    alert('일치하는 데이터가 없습니다');
                }

                setTeamData(response.data.team);
            } catch (err) {
                alert(err);
            }
        };

        const getMemberList = async () => {
            const players = await axios.get<PlayersType>(
                `${process.env.REACT_APP_SERVER_HOST}:${
                    process.env.REACT_APP_SERVER_PORT || 3000
                }/api/team/${teamId}/players`
            );

            console.table(players.data);
            setPlayers(players.data);
        };

        const getTeamStats = async () => {
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
        };

        const getTopPlayer = async () => {
            const getTopMembers = await axios.get<TopPlayerType>(
                `${process.env.REACT_APP_SERVER_HOST}:${
                    process.env.REACT_APP_SERVER_PORT || 3000
                }/api/statistics/${teamId}/top-player`,
                {
                    params: {
                        teamId,
                    },
                }
            );

            setTopPlayer(getTopMembers.data);
        };

        const getYellowAndRedCards = async () => {
            const getYellowAndRedCardsAxiosData = await axios.get<YellowAndRedCardsType>(
                `${process.env.REACT_APP_SERVER_HOST}:${
                    process.env.REACT_APP_SERVER_PORT || 3000
                }/api/team/${teamId}/cards`,
                {
                    params: {
                        teamId,
                    },
                }
            );

            setYellowAndRedCards(getYellowAndRedCardsAxiosData.data);
        };

        const loadPage = async () => {
            if (teamId) {
                await getTeam();
                await checkIfIsCreator();
                await getMemberList();
                await getTeamStats();
                await getTopPlayer();
                await getYellowAndRedCards();
            }
        };

        loadPage(); // 데이터를 불러오는 함수 호출
    }, [teamId]);

    useEffect(() => {
        const getWinRate = () => {
            if (teamStats?.wins && teamStats?.totalGames) {
                setWinRate(Math.floor((teamStats?.wins / teamStats?.totalGames) * 100));
            }
        };

        setTeamGraphData({
            data: [
                {
                    stats: '골',
                    myTeam: teamStats?.goals ?? 0,
                    avgTeam: teamStats?.otherTeam.totalGoals ?? 0,
                },
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

        getWinRate();
    }, [teamStats]);

    useEffect(() => {
        if (teamStats?.totalGames === 0) {
            setValidationMsg('경기 통계를 위한 게임수가 부족합니다.');
        } else if (!teamStats?.otherTeam) {
            setValidationMsg('경기 통계를 위한 다른팀들의 통계가 부족합니다.');
        }
    }, [teamStats?.totalGames]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    useEffect(() => {
        const setImage = async () => {
            if (topPlaeyr?.topGoals[0]?.image) {
                const imageUrl = await getImageUrl(topPlaeyr?.topGoals[0].image);
                setTopGoalsPlayer(imageUrl);
            }
            if (topPlaeyr?.topAssists[0]?.image) {
                const imageUrl = await getImageUrl(topPlaeyr?.topAssists[0].image);
                setTopAssistsPlayer(imageUrl);
            }
            if (topPlaeyr?.topAttactPoint[0]?.image) {
                const imageUrl = await getImageUrl(topPlaeyr?.topAttactPoint[0].image);
                setAttactPointPlayer(imageUrl);
            }
            if (topPlaeyr?.topJoining[0]?.image) {
                const imageUrl = await getImageUrl(topPlaeyr?.topJoining[0].image);
                setTopGamesPlayer(imageUrl);
            }
            if (topPlaeyr?.topSave[0]?.image) {
                const imageUrl = await getImageUrl(topPlaeyr?.topSave[0].image);
                setTopSavePlayer(imageUrl);
            }
        };

        setImage();
    }, [topPlaeyr]);

    const data = [
        {
            id: 'ruby',
            label: 'ruby',
            value: 431,
            color: 'hsl(126, 70%, 50%)',
        },
        {
            id: 'c',
            label: 'c',
            value: 189,
            color: 'hsl(116, 70%, 50%)',
        },
    ];

    return (
        <Layout>
            <div>
                <br />
                {/* 데이터 로딩 중이면 로딩 메시지를 표시 */}
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    /* 구단주일 경우에만 항목 표시 */
                    isCreator && (
                        <>
                            <Button onClick={() => navigate('/match')}>경기 예약</Button>
                        </>
                    )
                )}
            </div>
            <ScoreboardContainer>
                <Card className="card-div">
                    <div className="team-info-preview">
                        <div className="team-info-wrap">
                            <ImageView imageUUID={teamData?.imageUUID} />
                            <div className="teamInfoContainer">
                                <h1 className="teamTitle">{teamData?.name}</h1>
                                <div>
                                    <div className="teamInfoWrap">
                                        <span className="teamInfoBoldTitle">감독</span>
                                        <span>{teamData?.creator.name}</span>
                                    </div>
                                    <div className="teamInfoWrap">
                                        <span className="teamInfoBoldTitle">연고지</span>
                                        <span>{`${teamData?.location.state} ${teamData?.location.city}`}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="teamStatusContainer">
                            <div className="teamStatusWrap">
                                <dl>
                                    <dt>승</dt>
                                    <dd>{teamStats?.wins ?? 0}</dd>
                                </dl>
                                <dl>
                                    <dt>무</dt>
                                    <dd>{teamStats?.draws ?? 0}</dd>
                                </dl>
                                <dl>
                                    <dt>패</dt>
                                    <dd>{teamStats?.loses ?? 0}</dd>
                                </dl>
                                <dl>
                                    <dt>승률</dt>
                                    <dd>{winRate ?? 0}%</dd>
                                </dl>
                            </div>
                            <div className="teamStatusWrap">
                                <dl>
                                    <dt>득점</dt>
                                    <dd>{teamStats?.goals ?? 0}</dd>
                                </dl>
                                <dl>
                                    <dt>실점</dt>
                                    <dd>{teamStats?.conceded ?? 0}</dd>
                                </dl>
                                <dl>
                                    <dt>경기</dt>
                                    <dd>{teamStats?.totalGames ?? 0}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card className="card-div">
                    <TitleText title="시즌통계" />
                    <div className="team-info-graph">
                        <MyResponsiveRadar data={teamGraphData}></MyResponsiveRadar>
                        {yellowAndRedCards?.yellowAndRedCards && yellowAndRedCards?.yellowAndRedCards.length > 0 ? (
                            <BasicBars yellowAndRedCards={yellowAndRedCards?.yellowAndRedCards ?? []} />
                        ) : (
                            <p>카드수집통계 집계에 필요한 데이터가 존재하지 않습니다.</p>
                        )}
                    </div>
                </Card>
                <Card className="card-div">
                    <TitleText title="탑 플레이어" />
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div
                            style={{
                                width: '25%',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '12px 24px',
                                border: '1px solid grey',
                            }}
                        >
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>득점</div>
                            {topPlaeyr?.topGoals.map((item, index) =>
                                index === 0 ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            borderBottom: '1px solid #e9e9e9',
                                            width: '100%',
                                            padding: '12px',
                                            marginBottom: '18px',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                width: '100%',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <img
                                                src={topGoalsPlayer}
                                                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                width: '120px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {index + 1}. {item.userName ?? ''}
                                        </div>
                                        <div style={{ color: 'red', opacity: 0.8 }}>{item.totalGoals}</div>
                                    </div>
                                ) : (
                                    <div
                                        style={{ display: 'flex', justifyContent: 'space-between', padding: '0 12px' }}
                                    >
                                        <div
                                            style={{
                                                width: '80px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                textAlign: 'left',
                                            }}
                                        >
                                            {index + 1}. {item.userName ?? ''}
                                        </div>
                                        <div>{item.totalGoals}</div>
                                    </div>
                                )
                            )}
                        </div>
                        <div
                            style={{
                                width: '25%',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '12px 24px',
                                border: '1px solid grey',
                            }}
                        >
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>도움</div>
                            {topPlaeyr?.topAssists.map((item, index) =>
                                index === 0 ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            borderBottom: '1px solid #e9e9e9',
                                            width: '100%',
                                            padding: '12px',
                                            marginBottom: '18px',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                width: '100%',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <img
                                                src={topAssistsPlayer}
                                                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                width: '120px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {index + 1}. {item.userName ?? ''}
                                        </div>
                                        <div style={{ color: 'red', opacity: 0.8 }}>{item.totalAssists}</div>
                                    </div>
                                ) : (
                                    <div
                                        style={{ display: 'flex', justifyContent: 'space-between', padding: '0 12px' }}
                                    >
                                        <div
                                            style={{
                                                width: '80px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                textAlign: 'left',
                                            }}
                                        >
                                            {index + 1}. {item.userName ?? ''}
                                        </div>
                                        <div>{item.totalAssists}</div>
                                    </div>
                                )
                            )}
                        </div>
                        <div
                            style={{
                                width: '25%',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '12px 24px',
                                border: '1px solid grey',
                            }}
                        >
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>공격P</div>
                            {topPlaeyr?.topAttactPoint.map((item, index) =>
                                index === 0 ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            borderBottom: '1px solid #e9e9e9',
                                            width: '100%',
                                            padding: '12px',
                                            marginBottom: '18px',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                width: '100%',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <img
                                                src={topAttactPointPlayer}
                                                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                width: '120px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {index + 1}. {item.userName ?? ''}
                                        </div>
                                        <div style={{ color: 'red', opacity: 0.8 }}>{item.attactPoint}</div>
                                    </div>
                                ) : (
                                    <div
                                        style={{ display: 'flex', justifyContent: 'space-between', padding: '0 12px' }}
                                    >
                                        <div
                                            style={{
                                                width: '80px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                textAlign: 'left',
                                            }}
                                        >
                                            {index + 1}. {item.userName ?? ''}
                                        </div>
                                        <div>{item.attactPoint}</div>
                                    </div>
                                )
                            )}
                        </div>
                        <div
                            style={{
                                width: '25%',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '12px 24px',
                                border: '1px solid grey',
                            }}
                        >
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>출전수</div>
                            {topPlaeyr?.topJoining.map((item, index) =>
                                index === 0 ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            borderBottom: '1px solid #e9e9e9',
                                            width: '100%',
                                            padding: '12px',
                                            marginBottom: '18px',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                width: '100%',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <img
                                                src={topGamesPlayer}
                                                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                width: '120px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {index + 1}. {item.userName}
                                        </div>
                                        <div style={{ color: 'red', opacity: 0.8 }}>{item.joining}</div>
                                    </div>
                                ) : (
                                    <div
                                        style={{ display: 'flex', justifyContent: 'space-between', padding: '0 12px' }}
                                    >
                                        <div
                                            style={{
                                                width: '80px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                textAlign: 'left',
                                            }}
                                        >
                                            {index + 1}. {item.userName ?? ''}
                                        </div>
                                        <div>{item.joining}</div>
                                    </div>
                                )
                            )}
                        </div>
                        <div
                            style={{
                                width: '25%',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '12px 24px',
                                border: '1px solid grey',
                            }}
                        >
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>세이브</div>
                            {topPlaeyr?.topSave.map((item, index) =>
                                index === 0 ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            borderBottom: '1px solid #e9e9e9',
                                            width: '100%',
                                            padding: '12px',
                                            marginBottom: '18px',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                width: '100%',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <img
                                                src={topSavePlayer}
                                                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                                            />
                                        </div>
                                        <div
                                            style={{
                                                width: '120px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {index + 1}. {item.userName}
                                        </div>
                                        <div style={{ color: 'red', opacity: 0.8 }}>{item.totalSave}</div>
                                    </div>
                                ) : (
                                    <div
                                        style={{ display: 'flex', justifyContent: 'space-between', padding: '0 12px' }}
                                    >
                                        <div
                                            style={{
                                                width: '80px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                textAlign: 'left',
                                            }}
                                        >
                                            {index + 1}. {item.userName ?? ''}
                                        </div>
                                        <div>{item.totalSave}</div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    {/* <Card className="team-card">
                            <p className="card-p-title">득점</p>
                            {topPlaeyr?.topGoals.map((item, index) =>
                                index === 0 ? (
                                    <div>
                                        <p>
                                            {item.userName} {item.totalGoals}득점
                                        </p>
                                        <Card.Img variant="top" src={topGoalsPlayer} />
                                    </div>
                                ) : (
                                    <Card.Body>
                                        <Card.Text className="card-p-text">
                                            {item.userName} {item.totalGoals}득점
                                        </Card.Text>
                                    </Card.Body>
                                )
                            )}
                        </Card> */}
                    {/* <Card className="team-card">
                            <p className="card-p-title">도움</p>
                            {topPlaeyr?.topAssists.map((item, index) =>
                                index === 0 ? (
                                    <>
                                        <p className="topPlayerStatusTitle">
                                            {item.userName} {item.totalAssists}도움
                                        </p>
                                        <Card.Img variant="top" src={topAssistsPlayer} />
                                    </>
                                ) : (
                                    <Card.Body>
                                        <Card.Text className="card-p-text">
                                            {item.userName} {item.totalAssists}도움
                                        </Card.Text>
                                    </Card.Body>
                                )
                            )}
                        </Card>
                        <Card className="team-card">
                            <p className="card-p-title">공격P</p>
                            {topPlaeyr?.topAttactPoint.map((item, index) =>
                                index === 0 ? (
                                    <>
                                        <Card.Img variant="top" src={topAttactPointPlayer} />
                                        <div>
                                            <p>{item.userName}</p>
                                            <p>{item.attactPoint}공격P</p>
                                        </div>
                                    </>
                                ) : (
                                    <Card.Body>
                                        <Card.Text className="card-p-text">
                                            {item.userName} {item.attactPoint}공격P
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
                                            {item.userName} {item.joining}경기
                                        </p>
                                        <Card.Img variant="top" src={topGamesPlayer} />
                                    </div>
                                ) : (
                                    <Card.Body>
                                        <Card.Text className="card-p-text">
                                            {item.userName} {item.joining}경기
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
                                            {item.userName} {item.totalSave}세이브
                                        </p>
                                        <Card.Img variant="top" src={topSavePlayer} />
                                    </div>
                                ) : (
                                    <Card.Body>
                                        <Card.Text className="card-p-text">
                                            {item.userName} {item.totalSave}세이브
                                        </Card.Text>
                                    </Card.Body>
                                )
                            )}
                        </Card> */}
                </Card>
                <Card className="card-div">{players && <PlaneTable data={players} />}</Card>
            </ScoreboardContainer>
        </Layout>
    );
};

export default Team;
