import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pagination } from "antd";
import Layout from "layouts/App";
import "./table.css";
import Geolocation from "@react-native-community/geolocation";
import { ScoreboardContainer } from "pages/MatchResult/styles";

interface Team {
  id: number;
  name: string;
  description: string;
  imageUUID: string;
  is_mixed_gender: boolean;
  gender: string;
  totalMember: number;
  team: {
    id: number;
    name: string;
    description: string;
    imageUUID: string;
    is_mixed_gender: boolean;
    gender: string;
    totalMember: number;
    location: {
      address: string;
      city?: string;
      district: string;
      state?: string;
      latitude: number;
      longitude: number;
    };
    createdAt: string;
    updatedAt: string;
  };
}

const TeamTable: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMixed, setIsMixed] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [region, setRegion] = useState<string>("");

  const fetchTeams = async (page: number = 1) => {
    try {
      let apiUrl = `${process.env.REACT_APP_SERVER_HOST}:${
        process.env.REACT_APP_SERVER_PORT || 3000
      }/api/team/?page=${page}`;

      if (searchQuery.trim() !== "") {
        apiUrl += `&name=${searchQuery}`;
      }

      if (isMixed.trim() !== "") {
        apiUrl += `&isMixed=${isMixed}`;
      }

      if (gender) {
        apiUrl += `&gender=${gender}`;
      }

      if (region.trim() !== "") {
        apiUrl += `&region=${encodeURIComponent(region)}`;
      }

      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

      setTeams(response.data.data);
      setTotal(response.data.total); // 서버에서 받은 전체 페이지 수로 설정
    } catch (error) {
      console.error("팀 정보를 불러오는 데 실패했습니다.", error);
      setTeams([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    // currentPage 상태가 변경될 때마다 fetchTeams 함수 호출
    fetchTeams(currentPage);
}, [currentPage, searchQuery, isMixed, gender, region]);


  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGender(e.target.value);
  };

  const handleMixedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsMixed(e.target.value);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRegion(e.target.value);
  };

  const handleSearchButtonClick = () => {
    fetchTeams();
  };

  
  const handleApplyButton = async (teamData: Team) => {
    try {
      if (!teamData) {
        console.error("No team data provided.");
        return;
      }

      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("Access token not found.");
        return;
      }

      // 가입 신청을 서버로 요청하는 비동기 작업 수행
      await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/team/${teamData.team.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );

      // 가입 신청 후 팀 데이터 다시 불러오기
      fetchTeams();

      // 가입 성공 메시지 표시
      alert("팀 신청이 성공적으로 완료되었습니다.");
    } catch (error) {
      console.error("Error applying to join the team:", error);
      // 가입 실패 메시지 표시
      alert("팀 신청에 실패했습니다.");
    }
  };

  return (
    <Layout>
      <ScoreboardContainer>
        <div>
          <div className="search-container">
            <input
              type="text"
              placeholder="이름 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  fetchTeams();
                }
              }}
            />
            {/* 혼성 여부 선택 */}
<select value={isMixed} onChange={handleMixedChange}>
  <option value="">혼성여부 선택</option>
  <option value="true">혼성</option>
  <option value="false">단일성별</option>
</select>
            <select value={gender} onChange={handleGenderChange}>
              <option value="">성별 선택</option>
              <option value="Male">남성</option>
              <option value="Female">여성</option>
            </select>
            <select value={region} onChange={handleRegionChange}>
              <option value="">전체 지역</option>
              <option value="서울특별시">서울특별시</option>
              <option value="부산광역시">부산광역시</option>
              <option value="인천광역시">인천광역시</option>
              <option value="대구광역시">대구광역시</option>
              <option value="대전광역시">대전광역시</option>
              <option value="광주광역시">광주광역시</option>
              <option value="울산광역시">울산광역시</option>
              <option value="세종특별자치시">세종특별자치시</option>
              <option value="경기도">경기도</option>
              <option value="충청북도">충청북도</option>
              <option value="충청남도">충청남도</option>
              <option value="전라남도">전라남도</option>
              <option value="경상북도">경상북도</option>
              <option value="경상남도">경상남도</option>
              <option value="강원특별자치도">강원특별자치도</option>
              <option value="전북특별자치도">전북특별자치도</option>
              <option value="제주특별자치도">제주특별자치도</option>
            </select>
            <button onClick={handleSearchButtonClick}>검색</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>팀 이름</th>
                <th>팀 설명</th>
                <th>혼성 여부</th>
                <th>성별</th>
                <th>인원수</th>
                <th>주소</th>
                <th>신청</th>
              </tr>
            </thead>
            <tbody>
              {teams &&
                teams.map((teamData, index) => (
                  <tr key={`teamData-${index}`}>
                    <td>{teamData.team.id}</td>
                    <td>{teamData.team.name}</td>
                    <td>{teamData.team.description}</td>
                    <td>
                      {teamData.team.is_mixed_gender ? "혼성" : "단일 성별"}
                    </td>
                    <td>{teamData.team.gender}</td>
                    <td>{teamData.totalMember}</td>
                    <td>{teamData.team.location.address}</td>
                    <td>
                      <button
                        onClick={async () => await handleApplyButton(teamData)}>
                        신청
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <Pagination
            defaultCurrent={currentPage}
            total={total}
            defaultPageSize={5}
            onChange={(value) => {
              setCurrentPage(value);
            }}
          />
        </div>
      </ScoreboardContainer>
    </Layout>
  );
};

export default TeamTable;
