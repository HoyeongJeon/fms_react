import { useState } from "react";
import { ErrorContainer, ErrorMessage } from "pages/Home/styles";
import styled from "styled-components";
import Button from "react-bootstrap/Button";

import Modal from "react-bootstrap/Modal";
import LayoutPreview from "layouts/AppPreview";
import { useNavigate } from "react-router-dom";

import { Typography } from "antd";

const { Title } = Typography;
const StyledButton = styled(Button)`
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

const HomePreview = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const handleClose = () => setShow(false);
  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleShow = () => setShow(true);

  return (
    <LayoutPreview>
      {
        <ErrorContainer>
          <ErrorMessage>
            속한 팀이 없습니다.
            <br />
            팀을 생성하거나 팀에 참가하세요.
          </ErrorMessage>
          <Button variant="dark" onClick={handleShow} size="lg">
            팀 생성
          </Button>
          <Button variant="dark" onClick={handleShow} size="lg">
            팀 참가하기
          </Button>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>사이트 프리뷰입니다.</Modal.Title>
            </Modal.Header>
            <Modal.Body>로그인을 해주세요!</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                닫기
              </Button>
              <Button variant="primary" onClick={handleLoginClick}>
                로그인 하러가기
              </Button>
            </Modal.Footer>
          </Modal>
        </ErrorContainer>
      }
    </LayoutPreview>
  );
};

export default HomePreview;
