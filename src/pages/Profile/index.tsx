import axios from "axios";
import Layout from "layouts/App";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useTokenStore } from "store/tokenStore";
import { useProfileStore } from "store/profileStore";
import { useUserStore } from "store/userStore";
import ListGroup from "react-bootstrap/ListGroup";
import { LinkContainer } from "pages/SignUp/styles";
import useSWR from "swr";
import fetcher from "utils/fetcher";

type Profile = {
  age: string;
  height: string;
  weight: string;
  preferredPosition: string;
  gender: string;
  [key: string]: string;
};

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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

const MapContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 20px;
`;

const Profile = () => {
  const { name } = useUserStore();
  const { id, gender, preferredPosition, height, weight, imageUUID } =
    useProfileStore();
  const { data: presignedURL } = useSWR(`/image/${imageUUID}`, fetcher);

  useEffect(() => {
    const container = document.getElementById("kakao-map")!;
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // Set initial coordinates
      level: 3, // Set initial zoom level
    };
    const map = new window.kakao.maps.Map(container, options);
  
    // Replace USER_LATITUDE and USER_LONGITUDE with actual coordinates
    const USER_LATITUDE = 37.5665;
    const USER_LONGITUDE = 126.9780;
    const markerPosition = new window.kakao.maps.LatLng(USER_LATITUDE, USER_LONGITUDE);
    const marker = new window.kakao.maps.Marker({ position: markerPosition });
    marker.setMap(map);
  }, []);
  

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
          <MapContainer id="kakao-map" />
        </ProfileContainer>
      </Wrapper>
    </Layout>
  );
};

export default Profile;
