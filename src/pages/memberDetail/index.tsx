import axios from 'axios';
import Layout from 'layouts/App';
import { ScoreboardContainer } from 'pages/MatchResult/styles';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';
import fetcher from 'utils/fetcher';
import './styles.css';
import PlaneTable from 'components/table/PlaneTable';
import { Table } from 'react-bootstrap';

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

interface User {
    id: number;
    profile: Profile;
}

interface Profile {
    age: number;
    birthdate: string;
    gender: string;
    height: number;
    id: number;
    presignedURL: string;
    name: string;
    phone: string;
    preferredPosition: string;
    skillLevel: number;
    weight: number;
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

const ProfileTable: React.FC<{ profileData: Profile | null }> = ({ profileData }) => {
    return (
        <div>
            {profileData && (
                <div className="profile-info">
                    <table>
                        <thead>
                            <tr>
                                <th>이름</th>
                                <th>나이</th>
                                <th>성별</th>
                                <th>키</th>
                                <th>몸무게</th>
                                <th>선호 포지션</th>
                                <th>사진</th>
                                {/* <th>실력</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td> {profileData.name}</td>
                                <td>{profileData.age}</td>
                                <td>{profileData.gender}</td>
                                <td>{profileData.height}cm</td>
                                <td>{profileData.weight}kg</td>
                                <td> {profileData.preferredPosition}</td>
                                <td>
                                    <ProfileImageWrapper>
                                        <img src={profileData.presignedURL} alt="프로필 이미지" />
                                    </ProfileImageWrapper>
                                </td>
                                {/* <td> {profileData.skillLevel}/10</td> */}
                            </tr>
                        </tbody>
                    </table>
                    {/* Add more profile information as needed */}
                </div>
            )}
        </div>
    );
};

const MemberDetail = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playerData, setPlayerData] = useState<PlayerData[] | null>(null);
    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const { data: presignedURL } = useSWR(`/image/${imageUrl}`, fetcher);

    const { memberId } = useParams();
    console.log('presignedURL', presignedURL);
    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');

                const response = await axios.get(
                    `${process.env.REACT_APP_SERVER_HOST}:${
                        process.env.REACT_APP_SERVER_PORT || 3000
                    }/api/match/member/${memberId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                        withCredentials: true,
                    }
                );
                console.log('response=', response);

                setImageUrl(response.data.data.user.profile.imageUUID);
                const { playerstats, user } = response.data.data;

                // Check if user property exists in the response
                if (user) {
                    const { profile } = user;
                    console.log('profile=', profile);
                    setProfileData(profile);
                    setProfileData(() => {
                        return { ...profile, presignedURL };
                    });
                    console.log('profileData', profileData);
                } else {
                    console.warn('User property not found in the API response.');
                    // Handle this case based on your requirements
                    // For now, setting profileData to null
                    setProfileData(null);
                }

                setPlayerData(playerstats);
            } catch (error) {
                console.error('데이터를 불러오는 중 오류 발생:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMemberData();
    }, [memberId, presignedURL]);

    return (
        <Layout>
            <div className="App">
                {loading && <p>Loading...</p>}
                {error && <p>Error: {error}</p>}

                {/* Use the ProfileTable component to render profile information */}
                {/* <ProfileTable profileData={profileData} /> */}

                {/* {playerData && playerData.length > 0 && (
                    <div>
                        <div className="season-total">
                            <table>
                                <thead>
                                    <tr>
                                        <th>경기 아이디</th>
                                        <th>경기 날짜</th>
                                        <th>경기 시간</th>
                                        <th>골</th>
                                        <th>어시스트</th>
                                        <th>무실점</th>
                                        <th>교체</th>
                                        <th>세이브</th>
                                        <th>경고</th>
                                        <th>퇴장</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{playerData[0].match_id}</td>
                                        <td>{playerData[0].match.date}</td>
                                        <td>{playerData[0].match.time}</td>
                                        <td>{playerData[0].goals}</td>
                                        <td>{playerData[0].assists}</td>
                                        <td>{playerData[0].clean_sheet}</td>
                                        <td>{playerData[0].substitutions}</td>
                                        <td>{playerData[0].save}</td>
                                        <td>{playerData[0].yellow_cards}</td>
                                        <td>{playerData[0].red_cards}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )} */}
            </div>
            <ScoreboardContainer>
                <div className="profile-main-div">
                    <ProfileImageWrapper>
                        <img src={presignedURL} alt="프로필 이미지" />
                    </ProfileImageWrapper>
                    <div className="profile-info">
                        <h3>마커스 래시포드</h3>
                        <p>수원FC</p>
                        <div className="profile-row">
                            <p className="profile-row-data">출생 1997.11.19</p>
                            <p className="profile-row-data">포지션 스트라이커</p>
                        </div>
                        <div className="profile-row">
                            <p className="profile-row-data">키 192cm</p>
                            <p className="profile-row-data">몸무게 81kg</p>
                        </div>
                    </div>
                </div>
            </ScoreboardContainer>
            <ScoreboardContainer>
                <h3>개인 통계</h3>
                1. 공격수(골 ) 2. 미드필더(골, 어시) 3. 수비수(클린시트) 4. 골키퍼(세이브)
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
                            <th>무실점</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </Table>
            </ScoreboardContainer>
        </Layout>
    );
};

export default MemberDetail;
