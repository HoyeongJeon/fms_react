import React, { useEffect, useState } from "react";
import axios from "axios";
import "./member.css";

import { Pagination } from "antd";
import Layout from "layouts/App";
import Modal from "react-bootstrap/Modal";
import { useTeamStore } from "store/teamStore";

interface Member {
  isStaff: boolean;
  joinDate: string;
  team: Team;
}

interface Team {
  name: string;
}

interface User {
  member: Member[];
  name: string;
}

interface Profile {
  id: number;
  name: string;
  skillLevel: number;
  weight: number;
  height: number;
  preferredPosition: string;
  image_url: string;
  age: number;
  phone: string;
  birthdate: Date;
  gender: string;
  location: {
    latitude: string;
    longitude: string;
    state: string;
    city: string;
    district: string;
    address: string;
  };
  user: User;
}

const MemberTable = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfiles, setSelectedProfiles] = useState<number[]>([]);
  const [gender, setGender] = useState<string>("");
  const [region, setRegion] = useState("");
  const [regionCategory, setRegionCategory] = useState("");

  const fetchProfiles = async () => {
    try {
      let apiUrl = `${process.env.REACT_APP_SERVER_HOST}:${
        process.env.REACT_APP_SERVER_PORT || 3000
      }/api/profile/available?page=${currentPage}`;

      if (searchQuery.trim() !== "") {
        apiUrl += `&name=${searchQuery}`;
      }

      if (gender) {
        apiUrl += `&gender=${gender}`;
      }

      if (region.trim() !== "") {
        apiUrl += `&region=${encodeURIComponent(region)}`; 
      }
      console.log("apiurl=", apiUrl);

      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

      console.log("response.data=", response.data);

      if (
        response.data &&
        response.data.data &&
        response.data.data.data.length > 0
      ) {
        const fetchedProfiles = response.data.data.data;
        console.log("Fetched profiles:", fetchedProfiles);
        setProfiles(fetchedProfiles);
        setTotal(response.data.data.total);
      } else {
        console.log("초대할수있는 사용자가 없습니다.");
        // 사용자에게 적절한 메시지를 표시할 수 있도록 처리
      }
    } catch (error) {
      console.error("프로필을 불러오는 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [currentPage, searchQuery, gender, region]);

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGender(e.target.value);
  };

  const changePage = async (page: number) => {
    setCurrentPage(page); // 페이지 변경 시 현재 페이지 업데이트
    // 페이지 변경 시 새로운 프로필을 불러오도록 함
    fetchProfiles();
  };
  

  // const changePage = async (page: number) => {
  //   try {
  //     const accessToken = localStorage.getItem("accessToken");
  
  //     const apiUrl = `${process.env.REACT_APP_SERVER_HOST}:${
  //       process.env.REACT_APP_SERVER_PORT || 3000
  //     }/api/profile/available/?page=${page || 1}&name=${searchQuery}&gender=${gender}&region=${region}`;
  
  //     const response = await axios.get(apiUrl, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       withCredentials: true,
  //     });
  
  //     const { total, data: profileDatas } = response.data.data;
  
  //     setProfiles(profileDatas);
  //     setTotal(total);
  //     setCurrentPage(page); // 페이지 변경 시 현재 페이지 업데이트
  //   } catch (error) {
  //     console.error("멤버 정보를 불러오는 데 실패했습니다.", error);
  //   }
  // };
  

  const handleInviteButton = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedProfile(null); // 모달을 닫을 때 선택된 사용자 ID 초기화
  };

  const { teamId, setTeamId } = useTeamStore();

  const handleConfirmInvite = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      // Make the API call to invite the selected profile to a team //멤버 스토어에서 가져올수있나?
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/team/${teamId}/user/${selectedProfile?.id}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );

      setShowModal(false);
      setSelectedProfile(null);

      // Refresh the page after confirmation
      window.location.reload();
    } catch (error) {
      console.error("Error inviting member:", error);
    }
  };

  const handleCancelInvite = () => {
    setShowModal(false);
    setSelectedProfile(null);
  };

  const handleSearchButtonClick = () => {
    fetchProfiles();
  };

  const handleCheckboxChange = (profileId: number) => {
    setSelectedProfiles((prevSelectedProfiles) => {
      if (prevSelectedProfiles.includes(profileId)) {
        return prevSelectedProfiles.filter((id) => id !== profileId);
      } else {
        return [...prevSelectedProfiles, profileId];
      }
    });
  };

  const handleInviteSelected = () => {};

  return (
    <Layout>
      <div>
        {showModal && selectedProfile && (
          <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>초대 확인 메세지</Modal.Title>
            </Modal.Header>
            <Modal.Body>{`${selectedProfile?.name} 팀에 초대하시겠습니까?`}</Modal.Body>
            <Modal.Footer>
              <button onClick={handleConfirmInvite}>확인</button>
              <button onClick={handleCancelInvite}>취소</button>
            </Modal.Footer>
          </Modal>
        )}
        <h2>멤버 초대</h2>
        <div>
          <div className="search-container">
            <input
              type="text"
              placeholder="이름 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  fetchProfiles();
                }
              }}
            />
            <button onClick={handleSearchButtonClick}>검색</button>
            {/* 수정 시작 */}
            <select value={gender || ''} onChange={handleGenderChange}>
              <option value="">성별 선택</option>
              <option value="Male">남성</option>
              <option value="Female">여성</option>
            </select>
            {/* 수정 끝 */}
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">전체 지역</option>
              <option value="서울">서울특별시</option>
              <option value="부산">부산광역시</option>
              <option value="인천">인천광역시</option>
              <option value="대구">대구광역시</option>
              <option value="대전">대전광역시</option>
              <option value="광주">광주광역시</option>
              <option value="울산">울산광역시</option>
              <option value="세종">세종특별자치시</option>
              <option value="경기">경기도</option>
              <option value="충북">충청북도</option>
              <option value="충남">충청남도</option>
              <option value="전남">전라남도</option>
              <option value="경북">경상북도</option>
              <option value="경남">경상남도</option>
              <option value="강원">강원특별자치도</option>
              <option value="전북">전북특별자치도</option>
              <option value="제주">제주특별자치도</option>
            </select>
          </div>
        </div>
        {profiles.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>몸무게</th>
                <th>키</th>
                <th>선호 포지션</th>
                <th>나이</th>
                <th>성별</th>
                <th>지역</th>
                <th>신청</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td>{profile.id}</td>
                  <td>{profile.user.name}</td>
                  <td>{profile.weight}</td>
                  <td>{profile.height}</td>
                  <td>{profile.preferredPosition}</td>
                  <td>{profile.age}</td>
                  <td>{profile.gender}</td>
                  <td>{profile.location.state}</td>
                  <td>
                    <button onClick={() => handleInviteButton(profile)}>
                      초대
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p> </p>
        )}
  <Pagination
          defaultCurrent={currentPage}
          total={total}
          defaultPageSize={5}
          onChange={(value) => {
            changePage(value);
          }}
        />
      </div>
    </Layout>
  );
};

export default MemberTable;
