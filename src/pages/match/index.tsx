import Layout from "layouts/App";
import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { Pagination } from "antd";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 경기장 카드를 가로로 정렬하기 위한 컨테이너
const RegionFilterContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const RegionFilter = styled.select`
  padding: 8px;
  font-size: 16px;
`;

const StadiumsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  overflow-y: auto;
  max-height: 100vh;
  margin: auto;
  padding-top: 10px;
  padding-left: 10px;

  &::-webkit-scrollbar {
    width: 10px;
    border-radius: 10px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 10px;
  }
`;

const CustomCard = styled(Card)`
  border: 2px solid #d6d6d6;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.3s ease-in-out;
  will-change: transform;
  transform-origin: center center;

  &:hover {
    transform: scale(1.007) translateZ(0);
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
    margin: -0.1%;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  min-width: 64px;
  border: none;
  border-radius: 20px;
  background-color: #f0f0f0;
  color: #000;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 5px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease-in-out;

  &:hover {
    background-color: #e6e6e6;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  }

  &:active {
    background-color: #dcdcdc;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.15);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.5);
  }
`;


const Match = () => {
  const [getField, setField] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("");
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
            <RegionFilterContainer>
        <RegionFilter
          value={selectedRegion}
          onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSelectedRegion(e.target.value)}
        >
          <option value="">전체 지역</option>
          <option value="서울특별시">서울특별시</option>
          <option value="부산광역시">부산광역시</option>
          <option value="인천광역시">인천광역시</option>
          <option value="대구광역시">대구광역시</option>
          <option value="대전광역시">대전광역시</option>
          <option value="광주광역시">광주광역시</option>
          <option value="울산광역시">울산광역시</option>
          <option value="세종특별자치시">세종특별자치시</option>
          <option value="경기도">경기도</option>
          <option value="충청북도">충청북도</option>
          <option value="충청남도">충청남도</option>
          <option value="전라남도">전라남도</option>
          <option value="경상북도">경상북도</option>
          <option value="경상남도">경상남도</option>
          <option value="강원특별자치도">강원특별자치도</option>
          <option value="전북특별자치도">전북특별자치도</option>
          <option value="제주특별자치도">제주특별자치도</option>
        </RegionFilter>
      </RegionFilterContainer>
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