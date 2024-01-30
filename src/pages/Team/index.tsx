import Layout from "layouts/App";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import useSWR from "swr";
import fetcher from "utils/fetcher";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTeamStore } from "store/teamStore";

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

const Team = () => {
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { teamId } = useTeamStore();
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    // 구단주 체크를 수행하는 함수
    const checkIfIsCreator = async () => {
      try {
        const response = await axios.get(
          `http://localhost:${
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
        console.error("데이터 불러오기 실패:", error);
        setLoading(false); // 데이터 로딩 실패
      }
    };

    checkIfIsCreator(); // 데이터를 불러오는 함수 호출
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <Layout>
      <div>Team</div>
      <p>일단 팀이 없으면 여기로 못들어옴</p>
      <p>본인이 속해있는 팀 정보가 나와야함</p>
      {/* 데이터 로딩 중이면 로딩 메시지를 표시 */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        /* 구단주일 경우에만 항목 표시 */
        isCreator && (
          <>
            <Button onClick={() => navigate("/match")}>경기 예약</Button>
            <p>구단주만 보이는 버튼</p>
          </>
        )
      )}
    </Layout>
  );
};

export default Team;
