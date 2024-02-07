import Layout from "layouts/App";
import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { Pagination } from "antd";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 경기장 카드를 가로로 정렬하기 위한 컨테이너
const StadiumsContainer = styled.div`
  display: flex;
  flex-wrap: wrap; // 카드들이 줄바꿈될 수 있도록 설정
  justify-content: center; // 카드들을 중앙 정렬
  gap: 20px; // 카드 간의 간격
  overflow-y: auto; // 세로 스크롤을 위한 오버플로우
  max-height: 100vh;
  margin: auto; // 중앙 정렬을 위한 마진 설정
  padding-top: 10px;
  padding-left: 10px;

  /* 스크롤바 전체에 대한 스타일 */
  &::-webkit-scrollbar {
    width: 10px;
    border-radius: 10px;
    background-color: transparent; /* 트랙 부분의 배경색을 투명하게 설정 */
  }

  /* 스크롤바의 썸(움직이는 부분)에 대한 스타일 */
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2); /* 썸 부분의 색상과 투명도 설정 */
    border-radius: 10px;
    &:hover {
      background-color: rgba(
        0,
        0,
        0,
        0.3
      ); /* 마우스를 올렸을 때 썸의 색상 변경 */
    }
  }

  /* 스크롤바 트랙에 대한 스타일 */
  &::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 10px;
  }
`;

const CustomCard = styled(Card)`
  border: 2px solid #d6d6d6; /* 테두리를 진하게 */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
  border-radius: 10px; /* 모서리 둥글게 */
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.3s ease-in-out; /* 확대와 그림자에 트랜지션 효과 추가 */
  will-change: transform; /* 성능 최적화를 위해 변화가 있을 속성 명시 */
  transform-origin: center center; // 확대의 기준점을 카드의 중앙으로 설정

  &:hover {
    transform: scale(1.007) translateZ(0); /* 마우스 오버 시 약간 확대 */
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2); /* 마우스 오버 시 그림자 강조 */
    margin: -0.1%;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  min-width: 64px;
  border: none;
  border-radius: 20px; /* 더 둥글게 조정 */
  background-color: #f0f0f0; /* 밝은 회색으로 변경 */
  color: #000;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600; /* 폰트 두께 조정 */
  margin: 0 5px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); /* 그림자 추가 */
  transition: all 0.3s ease-in-out; /* 부드러운 전환 효과 추가 */

  &:hover {
    background-color: #e6e6e6; /* 호버 시 배경색 변경 */
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); /* 호버 시 그림자 강조 */
  }

  &:active {
    background-color: #dcdcdc; /* 클릭 시 배경색 변경 */
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.15); /* 클릭 시 그림자 약화 */
  }

  &:focus {
    outline: none; /* 포커스 시 윤곽선 제거 */
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5); /* 포커스 시 그림자 추가 */
  }
`;

const Match = () => {
  const [getField, setField] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  type Field = {
    id: number;
    location_id: number;
    field_name: string;
    image_url: string;
    phone_number: string;
    locationfield: object;
  };

  const navigateToBooking = (Field: any) => {
    navigate("/match/book", {
      state: {
        fieldId: Field.id,
        fieldName: Field.field_name,
        locationId: Field.location_id,
        imageUrl: Field.image_url,
        phone: Field.phone_number,
        address: Field.locationfield.address,
      },
    });
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    const findAllSoccerField = async (page: number = 1) => {
      try {

        let apiUrl = `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/soccerfield/page/?page=${page}`;
  
        // 검색어가 있는 경우 검색 쿼리 추가
        if (searchQuery.trim() !== "") {
          apiUrl += `&name=${searchQuery}`;
        }

        const response = await axios.get(apiUrl,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Bearer 토큰 추가
            },
            withCredentials: true,
          }
        );

        const fieldData = response.data.data;

        console.log('fieldData:',fieldData);

        setField(fieldData); // creatorId가 존재하면 구단주로 간주
        setTotal(response.data.total);

        setLoading(false); // 데이터 로딩 완료
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        setLoading(false); // 데이터 로딩 실패
        setTotal(0);
      }
    };

    findAllSoccerField(); // 데이터를 불러오는 함수 호출
  }, []);

  const changePage = async (page: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/soccerfield/page/?page=${page || 1}&name=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      
      const fieldData = response.data.data;

      setField(fieldData); // creatorId가 존재하면 구단주로 간주
      setTotal(response.data.total);

    } catch (error) {
      console.error("멤버 정보를 불러오는 데 실패했습니다.", error);
    }
  };

  return (
    <Layout>
      <h2>경기장 목록</h2>
      <StadiumsContainer>
        {getField.map((field) => (
          <CustomCard
            key={field.id}
            style={{ width: "20rem", height: "500px", marginBottom: "20px" }}>
            <Card.Img
              variant="top"
              src={field.image_url}
              style={{
                width: "100%", // 이미지의 너비를 카드 너비에 맞춤
                height: "200px", // 이미지의 높이를 지정
                objectFit: "cover", // 이미지가 비율을 유지하면서 주어진 높이에 맞게 조정됨
              }}
            />
            <Card.Body>
              <Card.Title>{field.field_name}</Card.Title>
              <Card.Text>경기장 정보</Card.Text>
              <Button onClick={() => navigateToBooking(field)}>
                일정 확인
              </Button>
            </Card.Body>
          </CustomCard>
        ))}
      </StadiumsContainer>
      <Pagination
        defaultCurrent={currentPage}
        total={total}
        defaultPageSize={8}
        onChange={(value) => {
          changePage(value);
        }}
      />
    </Layout>
  );
};

export default Match;
