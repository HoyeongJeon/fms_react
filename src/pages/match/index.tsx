import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import { Pagination } from "antd";

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
  const [getField, setField] = useState<Field[]>([]); // Field[] 타입으로 초기화
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("");

  const navigate = useNavigate();

  // Field 인터페이스 정의
  interface Field {
    id: number;
    location_id: number;
    field_name: string;
    image_url: string;
    phone_number: string;
    locationfield: object;
  }


  useEffect(() => {
    const findAllSoccerField = async (page = 1) => {
      try {
        let apiUrl = `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/soccerfield/page/?page=${page}`;

        if (searchQuery.trim() !== "") {
          apiUrl += `&name=${searchQuery}`;
        }

        if (selectedRegion.trim() !== "") {
          apiUrl += `&region=${selectedRegion}`;
        }

        const response = await axios.get(apiUrl, {
          withCredentials: true,
        });

        const fieldData = response.data.data;
        setField(fieldData);
        setTotal(response.data.total);
        setLoading(false);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        setLoading(false);
        setTotal(0);
      }
    };

    findAllSoccerField();
  }, [currentPage, selectedRegion, searchQuery]);

  const navigateToBooking = (field) => {
    navigate("/match/book", {
      state: {
        fieldId: field.id,
        fieldName: field.field_name,
        locationId: field.location_id,
        imageUrl: field.image_url,
        phone: field.phone_number,
        address: field.locationfield.address,
      },
    });
  };

  const changePage = async (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h2>경기장 목록</h2>
      <RegionFilterContainer>
        <RegionFilter
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
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
      <StadiumsContainer>
        {getField.map((field) => (
          <CustomCard
            key={field.id}
            style={{ width: "20rem", height: "500px", marginBottom: "20px" }}
          >
            <Card.Img
              variant="top"
              src={field.image_url}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
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
        onChange={changePage}
      />
    </div>
  );
};

export default Match;
