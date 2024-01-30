import axios from "axios";
import Layout from "layouts/App";
import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { useTokenStore } from "store/tokenStore";

type Profile = {
  // name: string;
  age: string;
  height: string;
  weight: string;
  preferredPosition: string;
  gender: string;
  // password: string;
  // confirmPassword: string;
  [key: string]: string; // 인덱스 서명 추가
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

const ProfileImagePlaceholder = styled.div`
  width: 120px; /* 이미지 크기 조정 */
  height: 120px;
  border: 2px solid black;
  // border-radius: 50%;
  margin-right: 2rem;
  align-items: center;
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

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border: 2px solid black;
  object-fit: cover; // 이미지가 네모난 형태에 맞게 채워집니다.
  cursor: pointer;
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

const Genders = ["Male", "Female", "Mixed"];

const RegisterProfile = () => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<File | null | string>(null); // 이미지 파일 상태를 추가
  const [profile, setProfile] = useState<Profile>({
    // name: "",
    age: "",
    height: "", // 키
    weight: "", // 몸무게
    gender: "", // 성별
    preferredPosition: "", // 포지션
    // password: "", // 비밀번호
    // confirmPassword: "", // 비밀번호 확인
  });
  const { userId } = useParams<{ userId: string }>();
  // const { accessToken } = useTokenStore();
  const accessToken = localStorage.getItem("accessToken");

  const {
    // name,
    age,
    height,
    weight,
    gender,
    preferredPosition,
    // password,
    // confirmPassword,
  } = profile;

  const [image, setImage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageUrl(e.target.files[0]); // 파일 객체 저
      const fileReader = new FileReader();
      fileReader.onload = (ev) => {
        if (ev.target?.result) {
          setImage(ev.target.result as string);
        }
      };
      fileReader.readAsDataURL(e.target.files[0]);
      // setImageUrl(e.target.files[0].name); // 이미지 파일 상태 업데이트
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("clicked");
    const formData = new FormData();

    for (let key in profile) {
      formData.append(key, profile[key]);
    }

    // if (password !== confirmPassword) {
    //   alert("비밀번호가 일치하지 않습니다.");
    //   return;
    // }

    const value = {
      // name,
      age,
      height,
      weight,
      gender,
      preferredPosition,
      // password,
      // confirmPassword,
    };
    // const blob = new Blob([JSON.stringify(value)], {
    //   type: "application/json",
    // });
    // formData.append("profile", blob);

    axios({
      method: "post",
      url: `${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/profile/`,
      data: value,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (res.status === 201) {
          navigate("/home");
        }
      })
      .catch((err) => {
        console.error(err.response);
      });
  };

  return (
    <Layout>
      <Wrapper>
        <ProfileContainer>
          {image ? (
            <ProfileImage src={image} alt="Profile" />
          ) : (
            <ProfileImagePlaceholder as="label">
              <input
                type="file"
                onChange={handleImageChange}
                style={{ display: "none" }} // 파일 입력을 숨깁니다
              />
              {image && <ProfileImage src={image} alt="Profile" />}
            </ProfileImagePlaceholder>
          )}
          <Form onSubmit={handleSubmit}>
            <h2>프로필(사용자)</h2>
            {Object.keys(profile).map((key) => {
              if (key === "preferredPosition") {
                return (
                  <Select
                    name={key}
                    value={profile[key]}
                    onChange={handleChange}
                    required>
                    <option value="">포지션 선택</option>

                    {Position.map((position) => (
                      <option value={position}>{position}</option>
                    ))}
                  </Select>
                );
              }
              // else if (key === "password" || key === "confirmPassword") {
              //   return (
              //     <Input
              //       key={key}
              //       name={key}
              //       type="password"
              //       placeholder={
              //         key === "password" ? "비밀번호" : "비밀번호 확인"
              //       }
              //       value={profile[key]}
              //       onChange={handleChange}
              //       required={key === "password" || key === "confirmPassword"}
              //     />
              //   );
              // }
              else if (key === "gender") {
                return (
                  <Select
                    name={key}
                    value={profile[key]}
                    onChange={handleChange}
                    required>
                    <option value="">성별</option>

                    {Genders.map((gender) => (
                      <option value={gender}>{gender}</option>
                    ))}
                  </Select>
                );
              } else {
                return (
                  <Input
                    key={key}
                    name={key}
                    type="text"
                    placeholder={key}
                    value={profile[key]}
                    onChange={handleChange}
                    required
                  />
                );
              }
            })}
            <Button type="submit">저장</Button>
          </Form>
        </ProfileContainer>
      </Wrapper>
    </Layout>
  );
};

export default RegisterProfile;
