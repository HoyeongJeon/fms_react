import Layout from "layouts/App";
import React, { useEffect, useState } from "react";
import axios from "axios";

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
  imageUrl: string;
  name: string;
  phone: string;
  preferredPosition: string;
  skillLevel: number;
  weight: number;
}

const ProfileTable: React.FC<{ profileData: Profile | null }> = ({
  profileData,
}) => {
  console.log("Profile Data:", profileData);

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
                {/* <th>실력</th> */}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td> {profileData.name}</td>
                <td>{profileData.age}</td>
                <td>{profileData.gender}</td>
                <td>{profileData.height}kg</td>
                <td>{profileData.weight}cm</td>
                <td> {profileData.preferredPosition}</td>
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

  useEffect(() => {
    const memberId = 74;

    const fetchMemberData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

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

        console.log("response.data=", response.data);

        const { playerstats, user } = response.data.data;

        // Check if user property exists in the response
        if (user) {
          const { profile } = user;
          setProfileData(profile);
        } else {
          console.warn("User property not found in the API response.");
          // Handle this case based on your requirements
          // For now, setting profileData to null
          setProfileData(null);
        }

        setPlayerData(playerstats);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, []);

  return (
    <Layout>
      <div className="App">
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}

        {/* Use the ProfileTable component to render profile information */}
        <ProfileTable profileData={profileData} />

        {playerData && playerData.length > 0 && (
          <div>
            {/* Render player statistics */}
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
        )}
      </div>
    </Layout>
  );
};

export default MemberDetail;
