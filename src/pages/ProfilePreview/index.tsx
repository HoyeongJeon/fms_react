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
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { ScoreboardContainer } from "pages/MatchResult/styles";
import LayoutPreview from "layouts/AppPreview";

type Profile = {
  height: string;
  weight: string;
  preferredPosition: string;
  //birthdate: string;
  location: {
    latitude: number;
    longitude: number;
    // state:string;
    city: string;
    district: string;
    address: string;
  };
  [key: string]:
    | string
    | { latitude: number; longitude: number }
    | undefined
    | number;
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

const ProfilePreview = () => {
  return (
    <LayoutPreview>
      <ScoreboardContainer>
        <Wrapper>
          <ProfileContainer>
            <ProfileImageWrapper>
              <img
                src="https://t2.gstatic.com/licensed-image?q=tbn:ANd9GcTt1_3DYt00pg7o5usPu4qi-AnYj_zQ1CmDtoeDHrmNfUEPjuKQSWx01WxA9_tCdW3f"
                alt="프로필 이미지"
              />
            </ProfileImageWrapper>
            <ListGroup>
              <ListGroup.Item>
                <span>이름: </span>
                손흥민
              </ListGroup.Item>
              <br />
              <ListGroup.Item>
                <span>성별: </span>
                Male
              </ListGroup.Item>
              <br />

              <ListGroup.Item>
                <span>선호 포지션: </span>
                Left Wing
              </ListGroup.Item>
              <br />
              <ListGroup.Item>
                <span>키: </span>
                184cm
              </ListGroup.Item>
              <br />
              <ListGroup.Item>
                <span>몸무게: </span>
                75kg
              </ListGroup.Item>
              <br />
              <LinkContainer>
                {/* <Link to={`/profile/${id}/edit`}>프로필 변경하기</Link> */}
              </LinkContainer>
            </ListGroup>
            <MapContainer id="kakao-map" />
          </ProfileContainer>
        </Wrapper>
      </ScoreboardContainer>
    </LayoutPreview>
  );
};

export default ProfilePreview;
