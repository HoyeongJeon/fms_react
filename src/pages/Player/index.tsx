import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pagination } from "antd";
import Layout from "layouts/App";
import "./table.css";
import { useTeamStore } from "store/teamStore";
import { useNavigate } from "react-router-dom";
import { configConsumerProps } from "antd/es/config-provider";

interface Member {
  id: number;
  user: User;
  isStaff: boolean;
}

interface User {
  id: number;
  email: string;
  name: string;
  profile: Profile;
}

interface Profile {
  preferredPosition: string;
  imageUrl: string;
  age: number;
}

const Player: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { teamId, setTeamId } = useTeamStore();
  const navigate = useNavigate();

  const fetchMembers = async (page: number = 1) => {
    try {
      let apiUrl = `${process.env.REACT_APP_SERVER_HOST}:${
        process.env.REACT_APP_SERVER_PORT || 3000
      }/api/team/${teamId}/members/?page=${page}`;

      // 검색어가 있는 경우 검색 쿼리 추가
      if (searchQuery.trim() !== "") {
        apiUrl += `&name=${searchQuery}`;
      }
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

      // 이 부분에서 getTeamId를 사용하는 코드 삭제
      // setTeamId(getTeamId);

      setMembers(response.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error("팀 정보를 불러오는 데 실패했습니다.", error);
      // Clear the members array in case of an error
      setMembers([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // teamId가 undefined이거나 null이면 fetchMembers를 호출하지 않음
        if (teamId === undefined || teamId === null) {
          console.error("Team ID is not defined.");
          return;
        }

        // teamId가 정의되어 있을 때만 setTeamId 호출
        setTeamId(teamId);

        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}:${
            process.env.REACT_APP_SERVER_PORT || 3000
          }/api/team/${teamId}/members/?page=${currentPage}&name=${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            withCredentials: true,
          }
        );
        setMembers(response.data.data);
        setTotal(response.data.total);
      } catch (error) {
        console.error("팀 정보를 불러오는 데 실패했습니다.", error);
        // Clear the members array in case of an error
        setMembers([]);
        setTotal(0);
      }
    };

    // 최초 호출 시에는 teamId가 undefined일 수 있으므로 setTeamId 호출을 하지 않음
    if (teamId !== undefined) {
      fetchData();
      const delay = setTimeout(() => {
        fetchData();
      }, 500);

      return () => clearTimeout(delay);
    }
  }, [teamId, currentPage, searchQuery]);

  const changePage = async (page: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/team/${teamId}/members/?page=${currentPage}&name=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      setMembers(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error("멤버 정보를 불러오는 데 실패했습니다.", error);
    }
  };

  const [show, setShow] = useState(false);

  const handleApplyButton = (team: Member) => {
    setSelectedMember(team);
    setShowModal(true);
    setShow(true);

    // Navigate to the MemberDetail page with the selected member's ID
    if (team.id) {
      navigate(`/team/member/${team.id}`);
    }
  };

  const handleSearchButtonClick = () => {
    fetchMembers();
  };

  return (
    <Layout>
      <h2>팀 멤버 조회</h2>
      <div>
        <div className="search-container">
          <input
            type="text"
            placeholder="이름 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                fetchMembers();
              }
            }}
          />
          <button onClick={handleSearchButtonClick}>검색</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>이름</th>
            <th>구단주 여부</th>
            <th>이메일</th>
            <th>선호 포지션</th>
            <th>나이</th>
            {/* <th>사진</th> */}
            <th>더보기</th>
          </tr>
        </thead>

        <tbody>
          {members &&
            members.map((member, index) => (
              <tr key={`memberData-${index}`}>
                <td>{member.id}</td>
                <td>{member.user.name}</td>
                {/* 구단 주인 여부에 따라 텍스트를 다르게 표시 */}
                <td>{member.isStaff ? "구단주" : "일반선수"}</td>
                <td>{member.user.email}</td>
                <td>{member.user.profile?.preferredPosition}</td>
                <td>{member.user.profile?.age}</td>
                {/* <td>{member.user.profile.imageUrl}</td> */}
                <td>
                  <button onClick={() => handleApplyButton(member)}>
                    링크
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
          changePage(value);
        }}
      />
    </Layout>
  );
};

export default Player;
