import { Card } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import './table.css';
import { PlayersType } from 'pages/Team';
import axios from 'axios';
import { useEffect, useState } from 'react';

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

    const getImageUrl = async (url: string) => {
        const getUrl = await axios.get<string>(
            `http://localhost:${process.env.REACT_APP_SERVER_PORT || 3000}/api/image/${url}`,
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
                    <tr>
                        <td style={{ width: '100px' }}>
                            <Card.Img
                                variant="top"
                                src={player.image ?? '/img/empty_profile_iamge.png'}
                                style={{ width: '35px', height: '35px' }}
                            />
                            {player.userName}
                        </td>
                        <td>{player.totalGames}</td>
                        <td>{player.totalGoals}</td>
                        <td>{player.totalAssists}</td>
                        <td>{player.attactPoint}</td>
                        <td>{player.totalYellowCards}</td>
                        <td>{player.totalRedCards}</td>
                        <td>{player.totalÇleanSheet}</td>
                        <td>{player.totalSave}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default PlaneTable;
