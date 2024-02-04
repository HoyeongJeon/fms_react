import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pagination } from "antd";
import Layout from "layouts/App";
import "./table.css";
import Modal from "react-bootstrap/Modal";
import { useTeamStore } from "store/teamStore";
import { useUserStore } from "store/userStore";
import Geolocation from "@react-native-community/geolocation";

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
      city: string;
      district: string;
      state: string;
      latitude: number;
      longitude: number;
    };
    createdAt: string;
    updatedAt: string;
  };
}


const TeamTable: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const fetchTeams = async (page: number = 1, query: string = "") => {
    try {
      const userLocation = await getUserLocation();
      const apiUrl = `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT || 3000}/api/team/?page=${page}&name=${query}`;
      const accessToken = localStorage.getItem("accessToken");
  
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });
      
      console.log("response.data.data=", response.data.data);
  
      const teamsData = response.data.data;
      const filteredTeams: Team[] = [];
  
      teamsData.forEach((teamData: Team) => {
        const teamLocation = teamData.team.location;
        
        if (teamLocation && 
            typeof teamLocation.latitude === 'number' &&
            typeof teamLocation.longitude === 'number' &&
            typeof userLocation.coords.latitude === 'number' &&
            typeof userLocation.coords.longitude === 'number') {
      
          console.log("Valid coordinates for distance calculation.");
      
          const distance = calculateDistance(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            teamLocation.latitude,
            teamLocation.longitude
          );
      
          console.log("Calculated Distance:", distance);
  
          // Check if distance is a valid number (not NaN)
          if (!isNaN(distance)) {
            if (distance <= 10) {
              filteredTeams.push(teamData);
            }
          } else {
            console.error("Invalid distance:", distance);
          }
        } else {
          console.error("Invalid team location data:", teamLocation);
        }
      });
  
      setTeams(filteredTeams);
      setTotal(filteredTeams.length);
    } catch (error) {
      console.error("팀 정보를 불러오는 데 실패했습니다.", error);
      setTeams([]);
      setTotal(0);
    }
  };
  
  useEffect(() => {
    const delay = setTimeout(() => {
      console.log("Fetching teams...");
      fetchTeams();
    }, 500);
  
    return () => clearTimeout(delay);
  }, [currentPage, searchQuery]);
  console.log("Current Page:", currentPage);
  console.log("Total Teams:", total);


  const changePage = async (page: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT || 3000}/api/team/?page=${page || 1}&name=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      setTeams(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error("멤버 정보를 불러오는 데 실패했습니다.", error);
    }
  };


  const getUserLocation = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      Geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number => {
    const R = 6371; // 지구 반지름 (단위: km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // 거리 (단위: km)
    
    return distance;
  };
  
  const [show, setShow] = useState(false);
  const { teamId, setTeamId } = useTeamStore();
  const { id, setUser } = useUserStore();

  const handleApplyButton = async (teamData: Team) => {
    try {
      // 팀 데이터를 불러올 비동기 작업 수행
      const teamDetails = await axios.get(
        `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT || 3000}/api/team/${teamData.team.id}`,
        {
          withCredentials: true,
        }
      );
      console.log("Server Response:", teamDetails);
      // 불러온 팀 데이터로 setSelectedTeam 호출
      setSelectedTeam(teamDetails.data.team);
      setShowModal(true);
      setShow(true);
    } catch (error) {
      console.error("팀 정보를 불러오는 데 실패했습니다.", error);
    }
  };

  const handleConfirmApply = async () => {
    try {
      if (selectedTeam) {
        const accessToken = localStorage.getItem("accessToken");

        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT || 3000}/api/team/${selectedTeam.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        setShowModal(false);
        setSelectedTeam(null);
        setShowSuccessAlert(true);

        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 5000);

        // Refresh the page after confirmation
        window.location.reload();
      } else {
        console.error("Selected Team is undefined");
        setShowErrorAlert(true);

        // Hide error message after 5 seconds
        setTimeout(() => {
          setShowErrorAlert(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      setShowErrorAlert(true);

      // Hide error message after 3 seconds
      setTimeout(() => {
        setShowErrorAlert(false);
      }, 3000);
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

  const handleLocationButtonClick = async () => {
    try {
      const userLocation = await getUserLocation();
      console.log("User location:", userLocation);
    } catch (error) {
      console.error("Error getting user location:", error);
    }
  };

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
        <div className="alert-container">
          {showSuccessAlert && (
            <div className="alert alert-success" role="alert">
              팀 신청이 성공했습니다!
            </div>
          )}
          {showErrorAlert && (
            <div className="alert alert-danger" role="alert">
              팀 신청에 실패했습니다.
            </div>
          )}
        </div>
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
          <button onClick={handleLocationButtonClick}>내 위치 확인</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>팀 이름</th>
              <th>팀 설명</th>
              {/* <th>로고 이미지</th> */}
              <th>혼성 여부</th>
              <th>성별</th>
              <th>인원수</th>
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
