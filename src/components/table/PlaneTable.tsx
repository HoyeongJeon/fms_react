import { Card } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import './table.css';
import { PlayersType } from 'pages/Team';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamStore } from 'store/teamStore';

interface PlaneTableType {
    data: PlayersType;
}

interface NewPlayerType {
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
}

const PlaneTable = (props: PlaneTableType) => {
    const [players, setPlayers] = useState<NewPlayerType[]>(props.data.players);
    const { teamId } = useTeamStore();

    const getImageUrl = async (url: string) => {
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

    useEffect(() => {
        const fetchAndSetPlayers = async () => {
            const updatedPlayers = await Promise.all(
                props.data.players.map(async (player) => {
                    if (player.image) {
                        const newUrl = await getImageUrl(player.image);
                        return { ...player, image: newUrl };
                    }
                    return player;
                })
            );
            setPlayers(updatedPlayers);
        };

        fetchAndSetPlayers();
    }, [props.data.players]);

    const movePage = useNavigate();
    const handleMemberDetail = (memberId: number) => {
        movePage(`/team/member/${memberId}`);
    };

    return (
        <Table className="table">
            <thead>
                <tr>
                    <th>선수</th>
                    <th>경기</th>
                    <th>득점</th>
                    <th>도움</th>
                    <th>공격P</th>
                    <th>경고</th>
                    <th>퇴장</th>
                    <th>무실점</th>
                    <th>세이브</th>
                </tr>
            </thead>
            <tbody>
                {players.map((player) => (
                    <tr onClick={() => handleMemberDetail(player.memberId)}>
                        <td style={{ width: '100px' }}>
                            <Card.Img
                                variant="top"
                                src={player.image ?? '/img/empty_profile_iamge.png'}
                                style={{ width: '35px', height: '35px' }}
                            />
                            {player.userName}
                        </td>
                        <td>{player.totalGames ?? 0}</td>
                        <td>{player.totalGoals ?? 0}</td>
                        <td>{player.totalAssists ?? 0}</td>
                        <td>{player.attactPoint ?? 0}</td>
                        <td>{player.totalYellowCards ?? 0}</td>
                        <td>{player.totalRedCards ?? 0}</td>
                        <td>{player.totalÇleanSheet ?? 0}</td>
                        <td>{player.totalSave ?? 0}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default PlaneTable;
