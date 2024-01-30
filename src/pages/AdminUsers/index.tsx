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
  team?: string; // team은 선택적 프로퍼티로, 값이 없을 수도 있습니다.
  phone?: string; // phone도 선택적 프로퍼티입니다.
  birthdate?: string; // birthdate도 선택적 프로퍼티입니다.
};

type SelectedUsers = {
  [key: number]: boolean;
};

const AdminUsers = () => {
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
        }/api/admin/users/${selectedUserId}`,
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

  const [users, setUsers] = useState<User[]>([]); // 사용자 목록을 저장할 상태
  const [total, setTotal] = useState(0); // 총 데이터 개수
  const [searchParams] = useSearchParams(); // URLSearchParams 객체
  useEffect(() => {
    const page = searchParams.get("page");
    const getUsers = async () => {
      try {
        const { data } = await authAxios.get(`/admin/users?page=${page || 1}`);
        setUsers(data.data); // 받아온 데이터 저징
        setTotal(data.total); // 전체 개수 저장
        setError(""); // 에러 상태를 초기화
      } catch (err) {
        // 에러 처리 로직
        setError("사용자 정보를 불러오는데 실패했습니다.");
        console.error(err);
      }
    };
    getUsers();
  }, []);

  const changePage = async (page: number) => {
    try {
      const { data } = await authAxios.get(`/admin/users?page=${page || 1}`);
      setUsers(data.data); // 받아온 데이터를 전역상태에 저장
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

  return (
    <AdminLayout>
      <span>admin 만 들어올 수 있도록 프론트 로직 추가해야함</span>
      {error && <div className="error-message">{error}</div>}{" "}
      <Table>
        <TableHead>
          <tr>
            <th></th>
            <th>이메일</th>
            <th>이름</th>
            <th>팀</th>
            <th>휴대폰번호</th>
            <th>생년월일</th>
          </tr>
        </TableHead>
        <TableBody>
          {users.map((aUser) => (
            <tr key={aUser.id}>
              <td>
                <Button variant="Light" onClick={() => handleShow(aUser.id)}>
                  ❌
                </Button>
                <Modal show={show} onHide={handleClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>삭제</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>유저를 삭제하시겠습니까?</Modal.Body>
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
              <td>{aUser.team || "N/A"}</td>
              <td>{aUser.phone || "N/A"}</td>
              <td>{aUser.birthdate || "N/A"}</td>
            </tr>
          ))}
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

export default AdminUsers;
