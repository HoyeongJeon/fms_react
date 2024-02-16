import React, { useEffect, useState } from "react";
import axios from "axios";
import "./member.css";

import { Pagination } from "antd";
import Layout from "layouts/App";
import Modal from "react-bootstrap/Modal";
import { useTeamStore } from "store/teamStore";

interface Member {
  id: number;
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
  invited: boolean; // 초대된 상태 저장
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

  const fetchProfiles = async (page: number) => {
    try {
      let apiUrl = `${process.env.REACT_APP_SERVER_HOST}:${
        process.env.REACT_APP_SERVER_PORT || 3000
      }/api/profile/available?page=${page}`;

      if (searchQuery.trim() !== "") {
        apiUrl += `&name=${searchQuery}`;
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

      if (
        response.data &&
        response.data.data &&
        response.data.data.data.length > 0
      ) {
        const fetchedProfiles = response.data.data.data.map((profile: Profile) => ({
          ...profile,
        }));
        // 초대된 멤버를 필터링하여 프로필 리스트에 저장
        setProfiles(fetchedProfiles);
        setTotal(response.data.data.total);
      } else {
        setProfiles([]);
      }
    } catch (error) {
      console.error("프로필을 불러오는 중 오류 발생:", error);
    }
  };


  useEffect(() => {
    fetchProfiles(currentPage); // 페이지 로드 시 프로필 가져오기
  }, [currentPage, searchQuery, gender, region]);

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGender(e.target.value);
  };

  const changePage = async (page: number) => {
    setCurrentPage(page);
    fetchProfiles(page); // 페이지 번호를 전달하여 호출
  };

  const handleInviteButton = (profile: Profile) => {
    setSelectedProfile(profile);
    if (!profile.invited) {
      // 초대된 멤버가 아닌 경우에만 모달 표시
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedProfile(null);
  };

  const { teamId, setTeamId } = useTeamStore();

  const handleConfirmInvite = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/team/${teamId}/${selectedProfile?.id}`,
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

      alert("초대 이메일을 보냈습니다");

      // 초대 후에 초대된 상태 업데이트
      setProfiles((prevProfiles) =>
        prevProfiles.map((profile) =>
          profile.id === selectedProfile?.id
            ? { ...profile, invited: true }
            : profile
        )
      );
    } catch (error) {
      console.error("Error inviting member:", error);
    }
  };

  const handleCancelInvite = () => {
    setShowModal(false);
    setSelectedProfile(null);
  };

  const handleSearchButtonClick = () => {
    fetchProfiles(currentPage);
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
            <Modal.Body>{`${selectedProfile?.user.name}님을 팀에 초대하시겠습니까?`}</Modal.Body>
            <Modal.Footer>
              <button onClick={handleConfirmInvite}>확인</button>
              <button onClick={handleCancelInvite}>취소</button>
            </Modal.Footer>
          </Modal>
        )}
        <h2>멤버 초대</h2>
        <div className="search-container">
  <select value={gender} onChange={handleGenderChange}>
    <option value="">혼성여부 선택</option>
    <option value="true">혼성</option>
    <option value="false">단일성별</option>
  </select>
  <select value={gender} onChange={handleGenderChange}>
    <option value="">성별 선택</option>
    <option value="Male">남성</option>
    <option value="Female">여성</option>
  </select>
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
  <input
    type="text"
    placeholder="이름 검색"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyPress={(e) => {
      if (e.key === "Enter") {
        fetchProfiles(currentPage);
      }
    }}
  />
  <button onClick={handleSearchButtonClick}>검색</button>
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
              {profiles
                .map((profile) => (
                  <tr key={profile.id}>
                    <td>{profile.id}</td>
                    <td>{profile.user.name}</td>
                    <td>{profile.weight}</td>
                    <td>{profile.height}</td>
                    <td>{profile.preferredPosition}</td>
                    <td>{profile.age}</td>
                    <td>{profile.gender}</td>
                    <td>{profile.location.state || profile.location.city}</td>
                    <td>
                      <button
                        onClick={() => handleInviteButton(profile)}
                        disabled={profile.invited} // 초대된 멤버의 경우 버튼 비활성화
                      >
                        초대
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p>데이터가 없습니다.</p>
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
