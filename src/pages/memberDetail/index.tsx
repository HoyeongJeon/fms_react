import axios, { AxiosError } from 'axios';
import Layout from 'layouts/App';
import { ScoreboardContainer } from 'pages/MatchResult/styles';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';
import fetcher from 'utils/fetcher';
import './styles.css';
import PlaneTable from 'components/table/PlaneTable';
import { Table } from 'react-bootstrap';
import { useUserStore } from 'store/userStore';
import { useTeamStore } from 'store/teamStore';

interface PlayerData {
    match_id: number;
    id: number;
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    substitutions: number;
    save: number;
    clean_sheet: number;
    match: Match;
}

interface Match {
    away_team_id: number;
    date: string;
    home_team_id: number;
    id: number;
    result: string;
    soccer_field_id: number;
    time: string;
}

interface MemberHistoryType {
    teamId: number;
    teamName: string;
    joinDate: Date;
    deletedAt: Date | null;
    totalGames: number;
    totalGoals: number;
    totalAssists: number;
    totalPoint: number;
    totalSave: number;
    totalCleanSheet: number;
}

interface Profile {
    id: number;
    joinDate: Date;
    teamName: string;
    userName: string;
    weight: number;
    height: number;
    preferredPosition: string;
    imageUUID: string;
    gender: string;
    age: number;
}

interface MemberRecordType {
    matchId: number;
    memberId: number;
    goals: number;
    assists: number;
    point: number;
    save: number;
    cleanSheet: number;
    matchDate: Date;
    matchTime: string;
    opposingTeamName: string;
}

const ProfileImageWrapper = styled.div`
    background-color: white;
    box-shadow: 10px 10px 10px black;
    border-radius: 100px;
    width: 200px;
    height: 200px;
    margin: 10px;

    & img {
        width: 200px;
        height: 200px;
        border-radius: 100px;
        object-fit: cover;
    }
`;

const MemberDetail = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playerData, setPlayerData] = useState<PlayerData[] | null>(null);
    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageUUID, setImageUUID] = useState<string>();
    const [memberHistory, setMemberHistory] = useState<MemberHistoryType[]>();
    const [memberRecord, setMemberRecord] = useState<MemberRecordType[]>();
    const { teamId } = useTeamStore();
    const navigate = useNavigate();

    const { memberId } = useParams();

    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');

                const response = await axios.get<Profile>(
                    `${process.env.REACT_APP_SERVER_HOST}:${
                        process.env.REACT_APP_SERVER_PORT || 3000
                    }/api/team/${teamId}/member/${memberId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                        withCredentials: true,
                    }
                );

                setProfileData(response.data);
                setImageUUID(response.data.imageUUID);
            } catch (error) {
                console.error('데이터를 불러오는 중 오류 발생:', error);
                alert('데이터를 불러오는 중 오류 발생:' + error);
            }
        };

        const fetchMemberHistory = async () => {
            try {
                const response = await axios.get<MemberHistoryType[]>(
                    `${process.env.REACT_APP_SERVER_HOST}:${
                        process.env.REACT_APP_SERVER_PORT || 3000
                    }/api/team/${teamId}/member/${memberId}/history`
                );

                setMemberHistory(response.data);
            } catch (error) {
                console.log(error);
            }
        };

        const fetchMemberRecord = async () => {
            try {
                const response = await axios.get<MemberRecordType[]>(
                    `${process.env.REACT_APP_SERVER_HOST}:${
                        process.env.REACT_APP_SERVER_PORT || 3000
                    }/api/team/${teamId}/member/${memberId}/record`
                );

                setMemberRecord(response.data);
            } catch (error) {
                console.log(error);
            }
        };

        if (teamId && memberId) {
            fetchMemberData();
            fetchMemberHistory();
            fetchMemberRecord();
        }
    }, []);

    useEffect(() => {
        const fetchImageUrl = async () => {
            if (!imageUUID) {
                return;
            }

            try {
                const response = await axios.get<string>(
                    `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT || 3000}/api/image/${
                        profileData?.imageUUID
                    }`,
                    {
                        withCredentials: true,
                    }
                );

                setImageUrl(response.data);
            } catch (error: any) {
                if (error.response.data) {
                    alert(error.response.data.message);
                    navigate('/team');
                }
            }
        };

        fetchImageUrl();
    }, [imageUUID]);

    return (
        <Layout>
            <ScoreboardContainer>
                <div className="profile-main-div">
                    <ProfileImageWrapper>
                        {imageUrl ? <img src={imageUrl} alt="프로필 이미지" /> : ''}
                    </ProfileImageWrapper>
                    <div className="profile-info">
                        <h3>{profileData?.userName}</h3>
                        <p>{profileData?.teamName}</p>
                        <div className="profile-row">
                            <p className="profile-row-data">나이 {profileData?.age}</p>
                            <p className="profile-row-data">포지션 {profileData?.preferredPosition}</p>
                        </div>
                        <div className="profile-row">
                            <p className="profile-row-data">키 {profileData?.height}cm</p>
                            <p className="profile-row-data">몸무게 {profileData?.weight}kg</p>
                        </div>
                    </div>
                </div>
            </ScoreboardContainer>
            <ScoreboardContainer>
                <h3>경기별 통계</h3>
                <Table className="table">
                    <thead>
                        <tr>
                            <th>상대팀</th>
                            <th>경기일</th>
                            <th>득점</th>
                            <th>도움</th>
                            <th>공격P</th>
                            <th>세이브</th>
                            <th>클린시트</th>
                        </tr>
                    </thead>
                    <tbody>
                        {memberRecord ? (
                            memberRecord.map((record) => (
                                <tr>
                                    <th>{record.opposingTeamName}</th>
                                    <th>
                                        {new Date(record.matchDate).toLocaleDateString()} - {record.matchTime}
                                    </th>
                                    <th>{record.goals ?? 0}</th>
                                    <th>{record.assists ?? 0}</th>
                                    <th>{record.point ?? 0}</th>
                                    <th>{record.save ?? 0}</th>
                                    <th>{record.cleanSheet === 1 ? 'O' : 'X'}</th>
                                </tr>
                            ))
                        ) : (
                            <p>존재 하지 않습니다.</p>
                        )}
                    </tbody>
                </Table>
            </ScoreboardContainer>
            <ScoreboardContainer>
                <h3>팀별 기록</h3>
                <Table className="table">
                    <thead>
                        <tr>
                            <th>팀</th>
                            <th>기간</th>
                            <th>경기</th>
                            <th>득점</th>
                            <th>도움</th>
                            <th>공격P</th>
                            <th>세이브</th>
                            <th>클린시트</th>
                        </tr>
                    </thead>
                    <tbody>
                        {memberHistory ? (
                            memberHistory.map((history) => (
                                <tr>
                                    <th>{history.teamName}</th>
                                    <th>
                                        {new Date(history.joinDate).toLocaleDateString()} ~{' '}
                                        {history.deletedAt ? new Date(history?.deletedAt).toLocaleDateString() : '현재'}
                                    </th>
                                    <th>{history.totalGames ?? 0}</th>
                                    <th>{history.totalGoals ?? 0}</th>
                                    <th>{history.totalAssists ?? 0}</th>
                                    <th>{history.totalPoint ?? 0}</th>
                                    <th>{history.totalSave ?? 0}</th>
                                    <th>{history.totalCleanSheet ? history.totalCleanSheet : 0}</th>
                                </tr>
                            ))
                        ) : (
                            <p>존재 하지 않습니다.</p>
                        )}
                    </tbody>
                </Table>
            </ScoreboardContainer>
        </Layout>
    );
};

export default MemberDetail;
