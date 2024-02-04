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
  user: User;
}

const ProfileTable = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfiles, setSelectedProfiles] = useState<number[]>([]);
  const fetchProfiles = async () => {
    try {
      let apiUrl = `${process.env.REACT_APP_SERVER_HOST}:${
        process.env.REACT_APP_SERVER_PORT || 3000
      }/api/profile/available?page=1`;

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

      setProfiles(response.data.data.data);
      setTotal(response.data.data.total);
    } catch (error) {
      console.error("프로필을 불러오는 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    // Perform the search directly when the user stops typing
    const delay = setTimeout(() => {
      fetchProfiles();
    }, 500);

    // Clear the timeout on component unmount or when the dependencies change
    return () => clearTimeout(delay);
  }, [currentPage, searchQuery]);

  const changePage = async (page: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const {
        data: {
          data: { total, data: profileDatas },
        },
      } = await axios.get(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/profile/available/?page=${page || 1}&name=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );

      setProfiles(profileDatas);
      setTotal(total);
    } catch (error) {
      console.error("멤버 정보를 불러오는 데 실패했습니다.", error);
    }
  };
  const [show, setShow] = useState(false);

  const handleInviteButton = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowModal(true);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
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
          <Modal show={show} onHide={handleClose}>
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
        ;<h2>멤버 정보</h2>
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
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedProfiles.length === profiles.length}
                  onChange={() => {
                    // Toggle all checkboxes when the header checkbox is clicked
                    setSelectedProfiles((prevSelectedProfiles) =>
                      prevSelectedProfiles.length === profiles.length
                        ? []
                        : profiles.map((profile) => profile.id)
                    );
                  }}
                />
              </th>
              <th>ID</th>
              <th>이름</th>
              {/* <th>실력</th> */}
              <th>몸무게</th>
              <th>키</th>
              <th>선호 포지션</th>
              <th>사진</th>
              <th>나이</th>
              <th>성별</th>
              {/* <th>스태프 여부</th> */}
              {/* {<th>팀 이름</th>}
              {<th>가입일</th>} */}
              <th>신청</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProfiles.includes(profile.id)}
                    onChange={() => handleCheckboxChange(profile.id)}
                  />
                </td>
                <td>{profile.id}</td>
                <td>{profile.name}</td>
                {/* <td>{profile.skillLevel}</td> */}
                <td>{profile.weight}</td>
                <td>{profile.height}</td>
                <td>{profile.preferredPosition}</td>
                <td>{profile.image_url}</td>
                <td>{profile.age}</td>
                <td>{profile.gender}</td>
                {/* <td>
                  {profile.user.member[0]?.isStaff ? "스태프" : "일반 회원"}
                </td>
                <td>{profile.user.member[0]?.team.name}</td>
                <td>{new Date(profile.user.member[0]?.joinDate).toLocaleDateString()}</td> */}

                <td>
                  <button onClick={() => handleInviteButton(profile)}>
                    초대
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <button onClick={handleInviteSelected}>선택된 멤버 초대</button>
        </div>
        <Pagination
          defaultCurrent={currentPage} // 현재 클릭한 페이지
          total={total} // 데이터 총 개수
          defaultPageSize={5} // 페이지 당 데이터 개수
          onChange={(value) => {
            changePage(value);
          }}
        />
      </div>
    </Layout>
  );
};

export default ProfileTable;
