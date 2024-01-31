import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pagination } from "antd";
import Layout from "layouts/App";
import "./table.css";
import Modal from "react-bootstrap/Modal";
import { useTeamStore } from "store/teamStore";
import { useUserStore } from "store/userStore";

interface Team {
  id: number;
  name: string;
  description: string;
  imageUUID: string;
  is_mixed_gender: boolean;
  gender: string;
  totalMember: number;
  team: Team;
}

const TeamTable: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTeams = async (page: number = 1) => {
    try {
      let apiUrl = `${process.env.REACT_APP_SERVER_HOST}:${
        process.env.REACT_APP_SERVER_PORT || 3000
      }/api/team/?page=${page}`;

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
      setTeams(response.data.data);
      setTotal(response.data.total);
      console.log("response.data.data=", response.data.data);
      console.log("esponse.data.total=", response.data.total);
    } catch (error) {
      console.error("팀 정보를 불러오는 데 실패했습니다.", error);
      // Clear the teams array in case of an error
      setTeams([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchTeams();
    }, 500);
    console.log("teams= ", teams);

    // Clear the timeout on component unmount or when the dependencies change
    return () => clearTimeout(delay);
  }, [currentPage, searchQuery]);

  const changePage = async (page: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/team/?page=${page || 1}&name=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      setTeams(response.data.data);
      setTotal(response.data.total);
      console.log("response.data.data=", response.data.data);
      console.log("esponse.data.total=", response.data.total);
    } catch (error) {
      console.error("멤버 정보를 불러오는 데 실패했습니다.", error);
    }
  };

  const [show, setShow] = useState(false);

  const handleApplyButton = (team: Team) => {
    console.log("apply button clicked!");
    setSelectedTeam(team);
    setShowModal(true);
    setShow(true);
  };
  const { teamId, setTeamId } = useTeamStore();
  const { id, setUser } = useUserStore();

  const handleConfirmApply = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/team/${teamId}/user/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      console.log("Invitation API response:", response.data);

      setShowModal(false);
      setSelectedTeam(null);

      // Refresh the page after confirmation
      window.location.reload();
    } catch (error) {
      console.error("Error inviting member:", error);
    }
  };

  const handleCancelApply = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedTeam(null); // 모달을 닫을 때 선택된 사용자 ID 초기화
  };
  const handleSearchButtonClick = () => {
    fetchTeams();
  };
  teams.map((team) => {
    console.log("team= ", team.team);
    console.log("team.id= ", team.team.id);
    console.log("team.name= ", team.team.name);
    console.log("team.description= ", team.team.description);
    console.log("team.logoImage= ", team.team.imageUUID);
    console.log("team.totalMember", team.totalMember);
  });
  return (
    <Layout>
      <div>
        {showModal && selectedTeam && (
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>초대 확인 메세지</Modal.Title>
            </Modal.Header>
            <Modal.Body>{`${selectedTeam?.name} 팀에 가입신청 하시겠습니까?`}</Modal.Body>
            <Modal.Footer>
              <button onClick={handleConfirmApply}>확인</button>
              <button onClick={handleCancelApply}>취소</button>
            </Modal.Footer>
          </Modal>
        )}
        <h2>팀 정보</h2>
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
            <button onClick={handleSearchButtonClick}>검색</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>팀 이름</th>
              <th>팀 설명</th>
              <th>로고 이미지</th>
              <th>혼성 여부</th>
              <th>성별</th>
              <th>인원수</th>
              <th>신청</th>
            </tr>
          </thead>

          <tbody>
            {teams &&
              teams.map((team, index) => (
                <tr key={`teamData-${index}`}>
                  <td>{team.team.id}</td>
                  <td>{team.team.name}</td>
                  <td>{team.team.description}</td>
                  <td>
                    <img
                      src={team.team.imageUUID}
                      alt={`${team.team.name} 로고`}
                    />
                  </td>
                  <td>{team.team.is_mixed_gender ? "혼성" : "단일 성별"}</td>
                  <td>{team.team.gender}</td>
                  <td>{team.totalMember}</td>
                  <td>
                    <button onClick={() => handleApplyButton(team)}>
                      신청
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Pagination
          defaultCurrent={currentPage} // 현재 클릭한 페이지
          total={total} // 데이터 총 개수
          defaultPageSize={5} // 페이지 당 데이터 개수
          onChange={(value) => {
            changePage(value);
          }}
        />
        {showModal && selectedTeam && (
          <div className="modal">
            <p>{`${selectedTeam.name} 팀에 초대하시겠습니까?`}</p>
            <button onClick={handleConfirmApply}>확인</button>
            <button onClick={handleCancelApply}>취소</button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeamTable;
