import FileUploader from "components/file/FileUploader";
import InputBox from "components/input/InputBox";
import KakaoLocation from "components/location/Location";
import RadioLayout from "components/radio/RadioLayout";
import Toggle from "components/toggle/Toggle";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "./create-team.css";
import { useDaumPostcodePopup } from "react-daum-postcode";
import styled from "styled-components";
import axios from "axios";
import Layout from "layouts/App";
import { useNavigate } from "react-router-dom";
import { Alert } from "antd";
import { ScoreboardContainer } from "pages/MatchResult/styles";
import { useTeamStore } from "store/teamStore";

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

  // 주소 입력시 이벤트
  useEffect(() => {
    searchLocation(addressValues.roadAddress);
  }, [addressValues.roadAddress]);

  const searchLocation = (address: string) => {
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
      } else {
        console.error("주소를 변환할 수 없습니다.");
      }
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    open({ onComplete: completeFunc });
    e.preventDefault();
  };

  // 라디오 이벤트
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedGender(e.target.value);
  };

  const radioOption: RadioLayout = {
    titleLabel: "성별",
    option: [
      {
        label: "남성",
        nameAndId: "gender",
        value: "Male",
      },
      {
        label: "여성",
        nameAndId: "gender",
        value: "Female",
      },
    ],
    onChange,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setTeamInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];

    if (file) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const onClickAddButton = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (
      !teamInfo.name ||
      !teamInfo.description ||
      !selectedFile ||
      !addressValues ||
      !addressValues.postalCode ||
      !addressValues.roadAddress
    ) {
      setValidationMessage("필수 입력값을 입력해주세요");
    }

    const formData = new FormData();
    formData.append("name", teamInfo.name);
    formData.append("description", teamInfo.description);
    formData.append("gender", selectedGender);
    formData.append("isMixedGender", selectedToggle.toString());
    formData.append("postalCode", addressValues.postalCode);
    formData.append("address", addressValues.roadAddress);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

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

      if (response.status === 201) {
        setTeamId(response.data.data.id);
        alert("팀등록이 완료되었습니다.");
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
      {
        <ScoreboardContainer>
          <form className="create-team-form">
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
              titleLabel={radioOption.titleLabel}
              option={radioOption.option}
              onChange={radioOption.onChange}
            />
            <Toggle
              label="혼성 여부"
              onToggle={(value) => setSelectedToggle(value)}
            />

            <div className="location-container">
              <label htmlFor="">연고지</label>
              <KakaoLocation center={addressValues.center} />
              <Button variant="dark" onClick={handleClick}>
                주소 검색
              </Button>
            </div>
            <div style={{ fontSize: "12px", color: "gray" }}>
              {validationMessage}
            </div>
            <Button variant="dark" onClick={onClickAddButton}>
              Add
            </Button>
          </form>
        </ScoreboardContainer>
      }
    </Layout>
  );
};

export default CreateTeam;
