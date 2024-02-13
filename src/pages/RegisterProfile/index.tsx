import axios from "axios";
import Layout from "layouts/App";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Alert } from "antd";
import FileUploader from "components/file/FileUploader";
import KakaoLocation from "components/location/Location";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { ScoreboardContainer } from "pages/MatchResult/styles";

type Profile = {
  // name: string;
  age: string;
  height: number;
  weight: number;
  preferredPosition: string;
  gender: string;
  // password: string;
  // confirmPassword: string;
  //[key: string]: string; // 인덱스 서명 추가
  birthdate: string;
  location: {
    latitude: string;
    longitude: string;
    // state:string;
    city: string;
    district: string;
    address: string;
  };
  [key: string]:
    | string
    | { latitude: string; longitude: string }
    | undefined
    | number;
};

type ProfileLocation = {
  latitude: string;
  longitude: string;
  //state:string;
  city: string;
  district: string;
  address: string;
};

type DaumPostcodeData = {
  roadAddress: string;
  zonecode: string;
  jibunAddress: string;
};

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
`;

const ProfileContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 이미지가 위쪽에 정렬되도록 함 */
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%; /* 폼의 너비를 부모 요소의 100%로 설정 */
`;

const Input = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.5rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #0056b3;
  }
`;

const Position = [
  "Goalkeeper",
  "Center Back",
  "Right Back",
  "Left Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Striker",
  "Forward",
  "Right Winger",
  "Left Winger",
];

const Genders = ["Male", "Female"];

const RegisterProfile = () => {
  const { kakao } = window;
  const open = useDaumPostcodePopup();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null | File>(null);
  const [profile, setProfile] = useState<Profile>({
    age: "", // Initialize age as an empty string
    height: 0,
    weight: 0,
    gender: "",
    preferredPosition: "",
    birthdate: "",
    location: {
      latitude: "",
      longitude: "",
      city: "",
      district: "",
      address: "",
    },
  });
  const today = new Date().toISOString().split("T")[0];
  const [location, setLocation] = useState<ProfileLocation>({
    latitude: "",
    longitude: "",
  } as ProfileLocation);

  const [kakaoMapLoaded, setKakaoMapLoaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];

    if (file) {
      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = (ev) => {
        if (ev.target?.result) {
          setImageUrl(ev.target.result as string);
        }
      };
      fileReader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImageUrl(null);
    }
  };

  const completeFunc = async (data: DaumPostcodeData) => {
    searchLocation(data.roadAddress);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!kakaoMapLoaded) {
      alert("Kakao 지도가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    open({ onComplete: completeFunc });
    e.preventDefault();
  };

  useEffect(() => {
    // Kakao 지도 API 로드 여부 확인
    if (!window.kakao) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&autoload=false`;
      script.onload = () => setKakaoMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setKakaoMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (kakaoMapLoaded) {
      // Kakao 지도 API 로드가 완료된 경우에만 실행
      searchLocation(profile.location.address);
    }
  }, [kakaoMapLoaded, profile.location.address]);

  const searchLocation = (address: string) => {
    // 주소가 있는 경우에만 API 호출
    if (address) {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          setLocation({
            latitude: result[0].road_address.y,
            longitude: result[0].road_address.x,
            city: result[0].road_address.region_1depth_name,
            district: result[0].road_address.region_2depth_name,
            address: result[0].road_address.address_name,
          });
          setProfile((prevProfile) => ({
            ...prevProfile,
            location: {
              latitude: result[0].road_address.y,
              longitude: result[0].road_address.x,
              city: result[0].road_address.region_1depth_name,
              district: result[0].road_address.region_2depth_name,
              address: result[0].road_address.address_name,
            },
          }));
        } else {
          console.error("주소를 변환할 수 없습니다.");
        }
      });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {};

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString();
  };

  const onClickAddButton = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (
      !profile.birthdate ||
      !profile.height ||
      !profile.weight ||
      !profile.preferredPosition ||
      !profile.gender ||
      !profile.location
    ) {
      setValidationMessage("필수 입력값을 입력해주세요");
      return;
    }

    const formData = new FormData();
    formData.append("height", `${profile.height}`);
    formData.append("weight", `${profile.weight}`);
    formData.append("preferredPosition", profile.preferredPosition);
    formData.append("age", calculateAge(profile.birthdate)); // Calculate age here
    formData.append("gender", profile.gender);
    formData.append("birthdate", profile.birthdate);
    formData.append("latitude", profile.location.latitude.toString());
    formData.append("longitude", profile.location.longitude.toString());
    formData.append("city", profile.location.city);
    formData.append("district", profile.location.district);
    formData.append("address", profile.location.address);

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        alert("프로필 등록이 완료되었습니다.");
        navigate("/home");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data.message);
        return;
      }
    }
  };

  return (
    <Layout>
      <ScoreboardContainer>
        <Wrapper>
          <ProfileContainer>
            <h2>프로필(사용자)</h2>
            <Form>
              {validationMessage && (
                <Alert
                  message="에러"
                  description={validationMessage}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setValidationMessage("")}
                ></Alert>
              )}
              <FileUploader
                descLabel="프로필 사진을 등록해주세요"
                changedFunc={handleFileChange}
              />
              <Button onClick={handleClick} disabled={!kakaoMapLoaded}>
                Open Map
              </Button>

              {kakaoMapLoaded && (
                <KakaoLocation
                  apiKey={process.env.REACT_APP_KAKAO_MAP_KEY || ""}
                  center={{
                    lat: parseFloat(location.latitude.toString() || "0"),
                    lng: parseFloat(location.longitude.toString() || "0"),
                    level: 3,
                  }}
                  style={{
                    width: "100%",
                    height: "300px",
                    marginBottom: "1rem",
                  }}
                  initialLevel={3}
                  initialLat={location.latitude.toString() || "0"}
                  initialLng={location.longitude.toString() || "0"}
                  onClick={(lat, lng) => handleMapClick(lat, lng)}
                />
              )}
              <Input
                name="birthdate"
                type="date"
                placeholder="생년월일"
                value={profile.birthdate}
                onChange={handleChange}
                max={today}
                required
              />

              {profile.birthdate && (
                <Input
                  name="age"
                  type="text"
                  placeholder="나이"
                  value={calculateAge(profile.birthdate)}
                  readOnly
                />
              )}
              {Object.keys(profile).map((key) => {
                if (key === "preferredPosition") {
                  return (
                    <Select
                      key={key}
                      name={key}
                      value={profile[key]}
                      onChange={handleChange}
                      required
                    >
                      <option value="">포지션 선택</option>
                      {Position.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </Select>
                  );
                } else if (key === "gender") {
                  return (
                    <Select
                      key={key}
                      name={key}
                      value={profile[key]}
                      onChange={handleChange}
                      required
                    >
                      <option value="">성별</option>
                      {Genders.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </Select>
                  );
                } else if (key === "height" || key === "weight") {
                  // For 'height' and 'weight', use specific placeholders
                  return (
                    <Input
                      key={key}
                      name={key}
                      type="number"
                      min="0"
                      placeholder={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize first letter
                      value={profile[key] === 0 ? "" : profile[key].toString()} // If the value is 0, show an empty string
                      onChange={handleChange}
                      required
                    />
                  );
                } else if (
                  key !== "birthdate" &&
                  key !== "age" &&
                  key !== "location"
                ) {
                  // For other fields, use 'key' as placeholder
                  return (
                    <Input
                      key={key}
                      name={key}
                      type="text"
                      placeholder={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize first letter
                      value={profile[key] as string}
                      onChange={handleChange}
                      required
                    />
                  );
                }
              })}
              <Button onClick={onClickAddButton}>저장</Button>
            </Form>
          </ProfileContainer>
        </Wrapper>
      </ScoreboardContainer>
    </Layout>
  );
};

export default RegisterProfile;
