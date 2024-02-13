import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Alert, message } from "antd";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ScoreboardContainer } from "pages/MatchResult/styles";
import { useTeamStore } from "store/teamStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import FileUploader from "components/file/FileUploader";
import InputBox from "components/input/InputBox";
import KakaoLocation from "components/location/Location";
import RadioLayout from "components/radio/RadioLayout";
import Toggle from "components/toggle/Toggle";

import "./create-team.css";
import { useDaumPostcodePopup } from "react-daum-postcode";
import Layout from "layouts/App";
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: ##ffffff;
`;
const CreateTeam = () => {
  const { kakao } = window;

  const [addressValues, setAddressValues] = useState({
    roadAddress: "",
    postalCode: "",
    center: {
      lat: "36.5",
      lng: "127.5",
      level: 20,
    },
  });
  const [teamInfo, setTeamInfo] = useState({
    name: "",
    description: "",
    location: {
      latitude: "",
      longitude: "",
      state: "",
      city: "",
      district: "",
      address: "",
    },
  });
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const [selectedToggle, setSelectedToggle] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const { setTeamId } = useTeamStore();
  const navigate = useNavigate();
  const open = useDaumPostcodePopup();
  const completeFunc = (data: any) => {
    setAddressValues({
      ...addressValues,
      roadAddress: data.roadAddress,
      postalCode: data.zonecode,
    });
  };

  useEffect(() => {
    searchLocation(addressValues.roadAddress);
  }, [addressValues.roadAddress]);

  const searchLocation = (address: string) => {
    if (address) {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          setAddressValues({
            ...addressValues,
            center: {
              lat: result[0].y,
              lng: result[0].x,
              level: 5,
            },
          });

          setTeamInfo((prevTeamInfo) => ({
            ...prevTeamInfo,
            location: {
              ...prevTeamInfo.location,
              latitude: result[0].y,
              longitude: result[0].x,
              state: result[0].address.region_1depth_name,
              city: result[0].address.region_2depth_name, 
              district: result[0].address.region_3depth_name, 
              address: result[0].address_name,
            },
          }));
        } else {
          console.error("주소를 변환할 수 없습니다.");
        }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];

    if (file) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setTeamInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedGender(e.target.value);
  };

  const handleMapClick = (latitude: number, longitude: number) => {};

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    open({ onComplete: completeFunc });
    e.preventDefault();
  };

  const onClickAddButton = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  
    if (
      !teamInfo.name ||
      !teamInfo.description ||
      !teamInfo.location.address ||
      !teamInfo.location.state ||
      !teamInfo.location.city ||
      !teamInfo.location.district ||
      !selectedFile
    ) {
      setValidationMessage("필수 입력값을 입력해주세요");
      return;
    }
  
    const formData = new FormData();
    formData.append("name", teamInfo.name);
    formData.append("description", teamInfo.description);
    formData.append("address", teamInfo.location.address);
    formData.append("state", teamInfo.location.state); 
    formData.append("city", teamInfo.location.city); 
    formData.append("district", teamInfo.location.district); 
    formData.append("latitude", teamInfo.location.latitude.toString());
    formData.append("longitude", teamInfo.location.longitude.toString());
    formData.append("gender", selectedGender);
    formData.append("isMixedGender", selectedToggle.toString());
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
    console.log( "teamInfo=",teamInfo)
  
    try {
      const accessToken = localStorage.getItem("accessToken");
  
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/team`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("response", response);
      if (response.data.status === 200) {
        setTeamId(response.data.data.id);
        message.success("팀등록이 완료되었습니다.");
        navigate("/home");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data.message);
        return;
      }
    }
  };
  
  

  return (
    <Layout>
      <ScoreboardContainer>
        <Wrapper>
          <form className="create-team-form">
            <div className="left-section">
              {validationMessage && (
                <Alert
                  message="에러"
                  description={validationMessage}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setValidationMessage("")}
                />
              )}
              <FileUploader
                descLabel="구단 로고를 등록해주세요"
                changedFunc={handleFileChange}
              />
              <InputBox
                inputLabel="구단명"
                name="name"
                onChange={handleInputChange}
              />
              <InputBox
                inputLabel="구단 설명"
                name="description"
                onChange={handleInputChange}
              />
              <RadioLayout
                titleLabel="성별"
                option={[
                  { label: "남성", nameAndId: "gender", value: "Male" },
                  { label: "여성", nameAndId: "gender", value: "Female" },
                ]}
                onChange={onChange}
              />
              <Toggle
                label="혼성 여부"
                onToggle={(value) => setSelectedToggle(value)}
              />
            </div>
            <div className="right-section">
              <div className="location-container">
                <label style={{ fontSize: "25px" }}>연고지</label>
                <KakaoLocation
                  apiKey={process.env.REACT_APP_KAKAO_MAP_KEY || ""}
                  center={{
                    lat: parseFloat(addressValues.center.lat),
                    lng: parseFloat(addressValues.center.lng),
                    level: 3,
                  }}
                  style={{
                    width: "100%",
                    height: "300px",
                    marginBottom: "1rem",
                  }}
                  initialLevel={3}
                  initialLat={teamInfo.location?.latitude.toString() || "0"}
                  initialLng={teamInfo.location?.longitude.toString() || "0"}
                  onClick={(e: any) =>
                    handleMapClick(e.latLng.getLat(), e.latLng.getLng())
                  }
                />
                <Button variant="dark" onClick={handleClick}>
                  주소 검색
                </Button>
              </div>
              <div style={{ fontSize: "12px", color: "gray" }}>
                {validationMessage}
              </div>
              <br />
              <Button variant="dark" onClick={onClickAddButton}>
                저장
              </Button>
            </div>
          </form>
        </Wrapper>
      </ScoreboardContainer>
    </Layout>
  );
};

export default CreateTeam;
