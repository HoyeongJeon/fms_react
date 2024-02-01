import { Card } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import './table.css';
import { PlayersType } from 'pages/Team';

interface PlaneTableType {
    data: PlayersType;
}

const PlaneTable = (props: PlaneTableType) => {
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
                {props.data.players.map((player) => (
                    <tr>
                        <td style={{ width: '100px' }}>
                            <Card.Img
                                variant="top"
                                src={player.image ? player.image : '/img/empty_profile_iamge.png'}
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
