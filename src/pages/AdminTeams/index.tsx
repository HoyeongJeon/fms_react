import AdminLayout from "layouts/AdminApp";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useSearchParams } from "react-router-dom";
import { Pagination } from "antd";
import { authAxios } from "utils/axios";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #eee;
  th {
    padding: 10px;
    border: 1px solid #ddd;
  }
`;

const TableBody = styled.tbody`
  tr:nth-child(odd) {
    background-color: #f9f9f9;
  }
  td {
    padding: 8px;
    border: 1px solid #ddd;
    text-align: center;
  }
`;

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  team?: Team; // team은 선택적 프로퍼티로, 값이 없을 수도 있습니다.
  phone?: string; // phone도 선택적 프로퍼티입니다.
  birthdate?: string; // birthdate도 선택적 프로퍼티입니다.
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  appleId?: string;
  googleId?: string;
  kakaoId?: string;
};

type Team = {
  id: number;
  name: string;
  description: string;
  imageUUID: string;
  is_mixedGender: boolean;
  totalMember: number;
  gender: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type SelectedUsers = {
  [key: number]: boolean;
};
const AdminTeams = () => {
  const [show, setShow] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null); // 현재 선택된 사용자의 ID 추적

  const [error, setError] = useState<string>("");

  const handleClose = () => {
    setShow(false);
    setSelectedUserId(null); // 모달을 닫을 때 선택된 사용자 ID 초기화
  };

  const handleShow = (userId: number) => {
    setShow(true);
    setSelectedUserId(userId); // 선택된 사용자 ID 설정
  };

  const handleDelete = async () => {
    if (selectedUserId === null) return;
    await axios
      .delete(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/admin/teams/${selectedUserId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      .then((res) => {
        setShow(false);
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
      });

    setShow(false);
  };

  const [total, setTotal] = useState(0); // 총 데이터 개수
  const [searchParams] = useSearchParams(); // URLSearchParams 객체
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const page = searchParams.get("page") || "1";
    setCurrentPage(parseInt(page));
    const getTeams = async () => {
      try {
        const { data } = await authAxios.get(`/admin/teams?page=${page}`);
        setTeams(data.data);
        setTotal(data.total);
        setError("");
      } catch (err) {
        setError("팀 정보를 불러오는데 실패했습니다.");

        console.error(err);
      }
    };
    getTeams();
  }, [searchParams]);

  const changePage = async (page: number) => {
    try {
      const { data } = await authAxios.get(`/admin/teams?page=${page || 1}`);
      setTeams(data.data); // 받아온 데이터를 전역상태에 저장
      setTotal(data.total); // 페이지네이션하면 전체 데이터 개수 주니까 이건 state에 저장
      setError(""); // 에러 상태를 초기화합니다.
    } catch (err) {
      // 에러 처리 로직
      setError("팀 정보를 불러오는데 실패했습니다.");
      console.error(err);
      // 추가적으로, err 객체에 따라 더 세부적인 에러 정보를 setError에 제공할 수 있습니다.
    }
  };

  const [currentPage, setCurrentPage] = useState(1);

  return (
    <AdminLayout>
      {error && <div className="error-message">{error}</div>}{" "}
      <Table>
        <TableHead>
          <tr>
            <th></th>
            <th>팀명</th>
            <th>소개</th>
            <th>성별</th>
            <th>혼성팀 여부</th>
          </tr>
        </TableHead>
        <TableBody>
          {teams.map((aTeam) => (
            <tr key={aTeam.id}>
              <td>
                <Button variant="Light" onClick={() => handleShow(aTeam.id)}>
                  ❌
                </Button>
                <Modal show={show} onHide={handleClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>삭제</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>팀을 삭제하시겠습니까?</Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                      아니요
                    </Button>
                    <Button variant="primary" onClick={() => handleDelete()}>
                      예
                    </Button>
                  </Modal.Footer>
                </Modal>
              </td>
              <td>{aTeam.name}</td>
              <td>{aTeam.description}</td>
              <td>{aTeam.gender}</td>
              <td>{aTeam.is_mixedGender ? "혼성" : "단일 성별"}</td>
            </tr>
          ))}
        </TableBody>
      </Table>
      <Pagination
        defaultCurrent={currentPage} // 현재 클릭한 페이지
        total={total} // 데이터 총 개수
        defaultPageSize={10} // 페이지 당 데이터 개수
        onChange={(value) => {
          changePage(value);
        }}
      />
    </AdminLayout>
  );
};

export default AdminTeams;
