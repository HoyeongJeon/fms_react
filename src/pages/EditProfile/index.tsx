import axios from "axios";
import Layout from "layouts/App";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { useProfileStore } from "store/profileStore";
import { Alert } from "antd";
import FileUploader from "components/file/FileUploader";
import KakaoLocation from "components/location/Location";
import { useDaumPostcodePopup } from "react-daum-postcode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Profile = {
  height: string;
  weight: string;
  preferredPosition: string;
  //birthdate: string;
  location: {
    latitude: string;
    longitude: string;
     state:string;
    city: string;
    district: string;
    address: string;
  };
  [key: string]: string | { latitude: string; longitude: string } | undefined;
};

type ProfileLocation = {
  latitude: string;
  longitude: string;
  state:string;
  city: string;
  district: string;
  address: string;
};

type DaumPostcodeData = {
  roadAddress: string;
  zonecode: string;
  jibunAddress: string;
};

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

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
`;

const ProfileContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
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

const EditProfile = () => {
  const { kakao } = window;
  const open = useDaumPostcodePopup();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const accessToken = localStorage.getItem("accessToken");
  const { id: profileId } = useProfileStore();
  const [profile, setProfile] = useState<Profile>({
    height: "",
    weight: "",
    preferredPosition: "",
    //birthdate: "",
    location: {
      latitude: "",
      longitude: "",
      state: "",
      city: "",
      district: "",
      address: "",
    },
  } as Profile);

  const [location, setLocation] = useState<ProfileLocation>({
    latitude: "",
    longitude: "",
  } as ProfileLocation);

  const [kakaoMapLoaded, setKakaoMapLoaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [addressValues, setAddressValues] = useState({
    roadAddress: "",
    postalCode: "",
    center: {
      lat: "36.5",
      lng: "127.5",
      level: 20,
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  // const handleDateChange = (date: Date | null) => {
  //   if (date) {
  //     const formattedDate = date.toISOString().split("T")[0];
  //     setProfile((prevProfile) => ({
  //       ...prevProfile,
  //       birthdate: formattedDate,
  //     }));
  //   }
  // };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];

    console.log("파일이 입력되었습니다 : ", file);
    if (file) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const completeFunc = async (data: DaumPostcodeData) => {
    setAddressValues({
      ...addressValues,
      roadAddress: data.roadAddress,
      postalCode: data.zonecode,
    });

    searchLocation(data.roadAddress);
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log("Map clicked");
    console.log("Latitude:", lat);
    console.log("Longitude:", lng);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!kakaoMapLoaded) {
      alert("Kakao 지도가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    open({ onComplete: completeFunc });
    e.preventDefault();
  };

  const onClickAddButton = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("profile=", profile);
    if (
      //!profile.birthdate ||
      !profile.height ||
      !profile.weight ||
      !profile.preferredPosition ||
      !profile.location
    ) {
      setValidationMessage("필수 입력값을 입력해주세요");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/profile/${profileId}`,
        {
          height: profile.height,
          weight: profile.weight,
          preferredPosition: profile.preferredPosition,
          latitude: profile.location.latitude,
          longitude: profile.location.longitude,
          city: profile.location.city,
          district: profile.location.district,
          state: profile.location.state,
          address: profile.location.address,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("response=", response);

      if (response.status === 200) {
        setProfile(response.data.data);
        alert("프로필 수정이 완료되었습니다.");
        navigate("/home");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data.message);
        return;
      }
    }
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
      searchLocation(addressValues.roadAddress);
    }
  }, [kakaoMapLoaded, addressValues.roadAddress]);

  const searchLocation = (address: string) => {
    // 주소가 있는 경우에만 API 호출
    console.log("address1=", address);
    if (address) {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          console.log("address2=", address);
          console.log("address2=", result);
          console.log("address2 x=", result[0].road_address.x);
          setAddressValues({
            ...addressValues,
            center: {
              lat: result[0].road_address.y,
              lng: result[0].road_address.x,
              level: 5,
            },
          });
          setLocation({
            latitude: result[0].road_address.y,
            longitude: result[0].road_address.x,
            state: result[0].road_address.region_1depth_name,
            city: result[0].road_address.region_2depth_name,
            district: result[0].road_address.region_3depth_name,
            address: result[0].road_address.address_name,
          });
          setProfile((prevProfile) => ({
            ...prevProfile,
            location: {
              latitude: result[0].road_address.y,
              longitude: result[0].road_address.x,
              state: result[0].road_address.region_1depth_name,
              city: result[0].road_address.region_2depth_name,
              district: result[0].road_address.region_3depth_name,
              address: result[0].road_address.address_name,
            },
          }));
        } else {
          console.error("주소를 변환할 수 없습니다.");
        }
      });
    }
  };

  return (
    <Layout>
      <Wrapper>
        <ProfileContainer>
          <h2>프로필 수정</h2>
          <Form>
            {validationMessage && (
              <Alert
                message="에러"
                description={validationMessage}
                type="error"
                showIcon
                closable
                onClose={() => setValidationMessage("")}></Alert>
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
                style={{ width: "100%", height: "300px", marginBottom: "1rem" }}
                initialLevel={3}
                initialLat={location.latitude.toString() || "0"}
                initialLng={location.longitude.toString() || "0"}
                onClick={(lat, lng) => handleMapClick(lat, lng)}
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
                    required>
                    <option value="">포지션 선택</option>
                    {Position.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </Select>
                );
              } else if (key !== "location") {
                // location 필드는 제외
                return (
                  <Input
                    key={key}
                    name={key}
                    type="text"
                    placeholder={`${key}를 입력해주세요`}
                    value={profile[key] as string | undefined}
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
    </Layout>
  );
};

export default EditProfile;
