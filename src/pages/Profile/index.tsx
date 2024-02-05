import axios from "axios";
import Layout from "layouts/App";
import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTokenStore } from "store/tokenStore";
import { useProfileStore } from "store/profileStore";
import { useUserStore } from "store/userStore";
import ListGroup from "react-bootstrap/ListGroup";
import { LinkContainer } from "pages/SignUp/styles";
import useSWR from "swr";
import fetcher from "utils/fetcher";

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

const styledDiv = styled.div`
  align-items: center;
  margin-top: -4px;
  display: flex;
`;

const ProfileImageWrapper = styled.div`
  background-color: white;
  box-shadow: 10px 10px 10px black;
  border-radius: 100px;
  width: 200px;
  height: 200px;
  margin: 10px;

  & img {
    width: 200px;
    height: 200px;
    border-radius: 100px;
    object-fit: cover;
  }
`;

const Profile = () => {
  const { name } = useUserStore();
  const { id, gender, preferredPosition, height, weight, imageUUID, age } =
    useProfileStore();
  const { data: presignedURL } = useSWR(`/image/${imageUUID}`, fetcher);
  return (
    <Layout>
      <Wrapper>
        <ProfileContainer>
          <ProfileImageWrapper>
            <img src={presignedURL} alt="프로필 이미지" />
          </ProfileImageWrapper>
          {id ? (
            <ListGroup>
              <ListGroup.Item>
                <span>이름: </span>
                {name}
              </ListGroup.Item>
              <br />
              <ListGroup.Item>
                <span>성별: </span>
                {gender}
              </ListGroup.Item>
              <br />
              <ListGroup.Item>
                <span>나이: </span>
                {age}
              </ListGroup.Item>
              <br />

              <ListGroup.Item>
                <span>선호 포지션: </span>
                {preferredPosition}
              </ListGroup.Item>
              <br />

              <ListGroup.Item>
                <span>키: </span>
                {height}cm
              </ListGroup.Item>
              <br />

              <ListGroup.Item>
                <span>몸무게: </span>
                {weight}kg
              </ListGroup.Item>
              <br />
              <LinkContainer>
                <Link to={`/profile/${id}/edit`}>프로필 변경하기</Link>
              </LinkContainer>
            </ListGroup>
          ) : (
            <div>loading...</div>
          )}
        </ProfileContainer>
      </Wrapper>
    </Layout>
  );
};

export default Profile;
