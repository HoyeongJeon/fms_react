import { MyResponsivePieType } from "components/graph/MyResponsePie";
import MyResponsiveLine, {
  MyResponsiveLineType,
} from "components/graph/MyResponsiveLine";
import MyResponsiveRadar, {
  MyResponsiveRadarType,
} from "components/graph/MyResponsiveRadar";
import ImageView from "components/image/ImageView";
import DlText from "components/text/DlText";
import TitleText from "components/text/TitleText";
import Layout from "layouts/App";
import { Card, CardGroup, Dropdown } from "react-bootstrap";
import styled from "styled-components";
import "./team-detail.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useFetcher, useNavigate, useParams } from "react-router-dom";
import { useTeamStore } from "store/teamStore";

interface TeamDetailType {
  id: string;
  createdAt: Date;
  name: string;
  description: string;
  imageUUID: string;
  isMixedGender: boolean;
  gender: string;
  creator: {
    id: number;
    email: string;
    name: string;
  };
  location: {
    id: number;
    state: string;
    city: string;
    district: string;
    address: string;
  };
}

const TeamDetail = () => {
  //let { teamIdParam } = useParams();
  const [temaData, setTeamData] = useState<TeamDetailType | null>(null);
  const { teamId, setTeamId } = useTeamStore();
  const navigate = useNavigate();

  const ScoreboardContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-height: 90vh; /* Maximum height of the scoreboard container */
    overflow-y: auto; /* Enable vertical scrolling */
    :: -webkit-scrollbar {
      /* Hide scrollbar for Chrome, Safari and Opera */
      display: none;
    }
  `;

  const test2: MyResponsiveRadarType = {
    data: [
      {
        stats: "골",
        myTeam: 91,
        avgTeam: 66,
      },
      {
        stats: "실점",
        myTeam: 91,
        avgTeam: 66,
      },
      {
        stats: "무실점",
        myTeam: 91,
        avgTeam: 66,
      },
    ],
  };

  const test3: MyResponsiveLineType = {
    data: [
      {
        id: "japan",
        data: [
          {
            x: "1월",
            y: 3,
          },
          {
            x: "2월",
            y: 2,
          },
          {
            x: "3월",
            y: 5,
          },
          {
            x: "4월",
            y: 6,
          },
          {
            x: "5월",
            y: 5,
          },
        ],
      },
    ],
  };

  useEffect(() => {
    // if (teamIdParam !== teamId) {
    //     alert('잘못된 접근입니다.');
    //     navigate('/home');
    //     return;
    // }

    const getTema = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}:${
            process.env.REACT_APP_SERVER_PORT || 3000
          }/api/team/${teamId}`,
          {
            params: {
              teamId,
            },
          }
        );

        if (!response) {
          alert("일치하는 데이터가 없습니다");
        }

        console.log(response.data);
        setTeamData(response.data);
      } catch (err) {
        alert(err);
      }
    };

    getTema();
  }, []);

  return (
    <Layout>
      <ScoreboardContainer>
        <Card>
          <div className="team-info-preview">
            <ImageView />
            <div className="team-div">
              <div className="team-child-div">
                {temaData && <TitleText title={temaData.name} />}
                {temaData && (
                  <DlText title="감독" content={temaData.creator.name} />
                )}
                {temaData && (
                  <DlText
                    title="연고지"
                    content={`${temaData.location.state} ${temaData.location.city}`}
                  />
                )}
              </div>
              <div>
                <div className="team-div">
                  <h5>2023</h5>
                  {/* <Dropdown>
                                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                                            년도
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item>2022</Dropdown.Item>
                                            <Dropdown.Item>2021</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown> */}
                </div>
                <div className="team-div">
                  <DlText title="승" content="2" className="team-dl" />
                  <DlText title="무" content="2" className="team-dl" />
                  <DlText title="패" content="2" className="team-dl" />
                </div>
                <div className="team-div">
                  <DlText title="득점" content="2" className="team-dl" />
                  <DlText title="실점" content="2" className="team-dl" />
                  <DlText title="경기" content="2" className="team-dl" />
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <TitleText title="시즌통계" />
          <div className="team-info-graph">
            <MyResponsiveRadar data={test2.data}></MyResponsiveRadar>
            <MyResponsiveLine data={test3.data}></MyResponsiveLine>
          </div>
        </Card>
        <Card>
          <TitleText title="탑 플레이어" />
          <CardGroup>
            <Card className="team-card">
              <p>득점</p>
              <p>1</p>
              <Card.Img
                variant="top"
                src="https://img1.daumcdn.net/thumb/S200x200/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F908372.jpg&scode=default_face_profile_big_p"
              />
              <Card.Body>
                <Card.Text>2. 래시포드</Card.Text>
                <Card.Text>3. 페르난데스</Card.Text>
              </Card.Body>
            </Card>
            <Card className="team-card">
              <p>도움</p>
              <p>1</p>
              <Card.Img
                variant="top"
                src="https://img1.daumcdn.net/thumb/S200x200/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F288205.jpg&scode=default_face_profile_big_p"
              />
              <Card.Body>
                <Card.Text>2. 래시포드</Card.Text>
                <Card.Text>3. 페르난데스</Card.Text>
              </Card.Body>
            </Card>
            <Card className="team-card">
              <p>공격P</p>
              <p>1</p>
              <Card.Img
                variant="top"
                src="https://img1.daumcdn.net/thumb/S76x76/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F903830.jpg&scode=default_face_profile_big_p"
              />
              <Card.Body>
                <Card.Text>2. 래시포드</Card.Text>
                <Card.Text>3. 페르난데스</Card.Text>
              </Card.Body>
            </Card>
            <Card className="team-card">
              <p>출전수</p>
              <p>1</p>
              <Card.Img
                variant="top"
                src="https://img1.daumcdn.net/thumb/S76x76/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F772389.jpg&scode=default_face_profile_big_p"
              />
              <Card.Body>
                <Card.Text>
                  <Card.Text>2. 래시포드</Card.Text>
                  <Card.Text>3. 페르난데스</Card.Text>
                </Card.Text>
              </Card.Body>
            </Card>
            <Card className="team-card">
              <p>출전수</p>
              <p>1</p>
              <Card.Img
                variant="top"
                src="https://img1.daumcdn.net/thumb/S76x76/?fname=https%3A%2F%2Ft1.daumcdn.net%2Fsports%2Fplayer%2F300%2F14%2F772389.jpg&scode=default_face_profile_big_p"
              />
              <Card.Body>
                <Card.Text>
                  <Card.Text>2. 래시포드</Card.Text>
                  <Card.Text>3. 페르난데스</Card.Text>
                </Card.Text>
              </Card.Body>
            </Card>
          </CardGroup>
        </Card>
      </ScoreboardContainer>
    </Layout>
  );
};

export default TeamDetail;
