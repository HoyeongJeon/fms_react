import { Card } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import './table.css';
import { MemberListType } from 'pages/Team';

interface PlaneTableType {
    data: MemberListType[];
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
                {props.data.map((member) => (
                    <tr>
                        <td style={{ width: '100px' }}>
                            <Card.Img
                                variant="top"
                                src={member.profile ? member.profile.imageUrl : '/img/empty_profile_iamge.png'}
                                style={{ width: '35px', height: '35px' }}
                            />
                            {member.user.name}
                        </td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default PlaneTable;
