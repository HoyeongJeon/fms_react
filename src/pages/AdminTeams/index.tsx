import axios from "axios";
import AdminLayout from "layouts/AdminApp";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { authAxios } from "utils/axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Pagination } from "antd";

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
  team?: string;
  phone?: string;
  birthdate?: string;
};

type Team = {
  id: number;
  name: string;
  description: string;
  gender: string;
  isMixedGender: boolean;
  createdAt: string;
};

const AdminTeams = () => {
  const [show, setShow] = useState(false);

  const [selectedTeamId, setselectedTeamId] = useState<number | null>(null); // 현재 선택된 사용자의 ID 추적

  const [error, setError] = useState<string>("");

  const handleClose = () => {
    setShow(false);
    setselectedTeamId(null); // 모달을 닫을 때 선택된 사용자 ID 초기화
  };

  const handleShow = (userId: number) => {
    setShow(true);
    setselectedTeamId(userId); // 선택된 사용자 ID 설정
  };

  const handleDelete = async () => {
    if (selectedTeamId === null) return;
    console.log("selectedTeamId= ", selectedTeamId);
    console.log(
      "url= ",
      `${process.env.REACT_APP_SERVER_HOST}:${
        process.env.REACT_APP_SERVER_PORT || 3000
      }/api/admin/teams/${selectedTeamId}`
    );
    await axios
      .delete(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/admin/teams/${selectedTeamId}`,
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
        console.log(err);
      });

    setShow(false);
  };

  const [teams, setTeams] = useState<Team[]>([]); // 사용자 목록을 저장할 상태
  const [total, setTotal] = useState(0); // 총 데이터 개수
  const [searchParams] = useSearchParams(); // URLSearchParams 객체
  useEffect(() => {
    const page = searchParams.get("page");
    const getTeams = async () => {
      try {
        const { data } = await authAxios.get(`/admin/teams?page=${page || 1}`);
        console.log(data);
        setTeams(data.data); // 받아온 데이터 저징
        setTotal(data.total); // 전체 개수 저장
        setError(""); // 에러 상태를 초기화
      } catch (err) {
        // 에러 처리 로직
        setError("사용자 정보를 불러오는데 실패했습니다.");
        console.error(err);
      }
    };
    getTeams();
  }, []);

  const changePage = async (page: number) => {
    try {
      const { data } = await authAxios.get(`/admin/teams?page=${page || 1}`);
      setTeams(data.data); // 받아온 데이터를 전역상태에 저장
      setTotal(data.total); // 페이지네이션하면 전체 데이터 개수 주니까 이건 state에 저장
      setError(""); // 에러 상태를 초기화합니다.
    } catch (err) {
      // 에러 처리 로직
      setError("사용자 정보를 불러오는데 실패했습니다.");
      console.error(err);
      // 추가적으로, err 객체에 따라 더 세부적인 에러 정보를 setError에 제공할 수 있습니다.
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  teams.map((aUser: any) => {
    aUser.createdAt = aUser.createdAt.split("T")[0];
  });

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
            <th>창단일</th>
          </tr>
        </TableHead>
        <TableBody>
          {teams.map((team: any) => (
            <tr key={team.id}>
              <td>
                <Button variant="Light" onClick={() => handleShow(team.id)}>
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
              <td>{team.name}</td>
              <td>{team.description}</td>
              <td>
                {team.isMixedGender
                  ? "혼성"
                  : team.gender === "Male"
                  ? "남성"
                  : "여성"}
              </td>
              <td>{team.createdAt.split("T")[0]}</td>
            </tr>
          ))}

          {/* {users.map((aUser: any) => (
            <tr key={aUser.id}>
              <td>
                <Button variant="Light" onClick={() => handleShow(aUser.id)}>
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
              <td>{aUser.email}</td>
              <td>{aUser.name}</td>
              <td>{aUser.team?.name || "무소속"}</td>
              <td>{aUser.phone || "N/A"}</td>
              <td>{aUser.birthdate || "N/A"}</td>
            </tr>
          ))} */}
        </TableBody>
      </Table>
      <Pagination
        defaultCurrent={currentPage} // 현재 클릭한 페이지
        total={total} // 데이터 총 개수
        defaultPageSize={5} // 페이지 당 데이터 개수
        onChange={(value) => {
          changePage(value);
        }}
      />
    </AdminLayout>
  );
};

export default AdminTeams;
