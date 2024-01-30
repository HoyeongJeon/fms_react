import Layout from "layouts/App";
import styled from "styled-components";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Dropdown from "react-bootstrap/Dropdown";
import Draggable from "react-draggable";
import formations from "./formations";
import Modal from "react-bootstrap/Modal";

const responsiveWidth = "768px";

const Sidebar = styled.div`
  width: 58%;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #d6d6d6; /* 선명한 회색 테두리를 추가 */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

const TripleContainer = styled.div`
  display: flex;
  width: 100%; // 부모의 전체 너비를 차지하도록 설정
  height: 95vh; // 높이를 화면의 전체 높이로 설정할 수도 있습니다
  // border: 2px solid #b3d4fc; // 옅은 푸른색 테두리 적용
  // border-radius: 15px; // 모서리 둥글게 설정

  > div {
    flex: 1; // 세 개의 div가 부모의 공간을 균등하게 나누어 가짐
    display: flex;
    //border: 2px solid green; // 각 div의 테두리를 초록색으로 설정
    &:not(:last-child) {
      margin-right: 2px; // 오른쪽 div에만 여백을 추가하여 구분
    }
  }
`;

const Button = styled.button`
  padding: 8px 15px; // 이 부분은 버튼의 크기를 조절하기 위해 변경할 수 있습니다.
  font-size: 1.1rem; // 이 부분은 버튼 안의 글씨 크기를 조절하기 위해 변경할 수 있습니다.
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  height: 7%;
  margin-left: 10px;
`;

const ImageContainer = styled.div`
  position: relative;
  height: 67vh;
  background-image: url("../../img/field.png"); // 배경 이미지로 경기장 이미지를 설정합니다.
  background-size: cover; // 배경 이미지가 컨테이너를 꽉 채우도록 합니다.
  background-position: center; // 배경 이미지를 중앙에 위치시킵니다.
  width: 100%; // 경기장 이미지의 너비를 설정합니다. 필요에 따라 조정하세요.

  @media (max-width: ${responsiveWidth}) {
    width: 100%; // 화면이 작아지면 너비를 100%로 설정하여 가로로 꽉 차게 합니다.
  }
`;

const SaveButton = styled(Button)`
  flex-grow: 9; // 저장 버튼이 더 큰 공간을 차지하도록 설정합니다.
`;

const CancelButton = styled(Button)`
  flex-grow: 1; // 취소 버튼은 작은 공간을 차지하도록 설정합니다.
  background-color: #808080;
`;

const Player = styled.div`
  position: absolute;
  width: 80px; // 선수 크기
  height: 80px;
  background-color: red;
  border-radius: 50%; // 원 모양
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem; // 텍스트 크기
  color: white; // 텍스트 색상
`;

// const PlayerList = styled.ul`
// list-style: none;
// padding: 0;
// `;

// const PlayerListItem = styled.li`
// padding: 10px;
// border-bottom: 1px solid #ddd;
// `;

const PlayerList = styled.ul`
    list-style: none;
    width: 30%;
    padding: 0;
    margin: 0;
    justify-content: center;
    overflow-y: auto; /* 목록이 길어질 경우 스크롤 가능하도록 설정 */
    max-height: 90vh; /* 화면 크기에 따라 최대 높이 설정 */
    overflow: visible;

    > h3 {
      margin-top:20px;
      }
`;

const PlayerListItem = styled.li`
    padding: 10px 20px; /* 좌우 여백 추가 */
    border-bottom: 1px solid #ddd;
    text-align: left; /* 텍스트를 왼쪽 정렬합니다 */
    font-size: 1.1rem; /* 폰트 크기를 살짝 늘립니다 */
    &:hover {
        background-color: #f0f0f0; /* 마우스 오버 시 배경색 변경 */
    }
`;

const RightContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
`;

const TacticalAdvantages = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 10px;
  text-align: left;
`;

const TacticalDisadvantages = styled(TacticalAdvantages)``;

const TacticalPoint = styled.li`
  &:before {
    content: '• ';
    color: green; // 장점은 녹색
  }
`;

const TacticalWeakness = styled(TacticalPoint)`
  text-align:left;
  &:before {
    content: '• ';
    color: red; // 단점은 적색
  }
`;

const Formation = () => {
  const navigate = useNavigate();

  const [homeTeamId, setHomeTeamId] = useState<string>("");
  const [playerPositions, setFormationInfo] = useState<
    SimplifiedFormationItem[]
  >([]);

  const location = useLocation();
  const { matchId } = location.state || {};

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    // 구단주 체크를 수행하는 함수
    const checkIfIsCreator = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}:${
            process.env.REACT_APP_SERVER_PORT || 3000
          }/api/match/creator`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Bearer 토큰 추가
            },
          }
        );
        const homeTeamId = response.data?.data[0]?.id;
        console.log("homeTeamId:", homeTeamId);
        setHomeTeamId(homeTeamId);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };

    checkIfIsCreator();
  }, []);

  interface MemberInfo {
    id: number;
    user: {
      name: string;
    };
    // 여기에 member의 다른 속성들을 추가할 수 있습니다.
  }

  interface FormationItem {
    id: number;
    position: string;
    formation: string;
    member: MemberInfo;
    // 여기에 FormationItem의 다른 속성들을 추가할 수 있습니다.
  }

  interface SimplifiedFormationItem {
    id: number;
    name: string; // Member의 user의 name
    position: string;
  }

  // homeTeamId 상태가 변경될 때마다 실행
  useEffect(() => {
    // 팀 포메이션 조회
    const getTeamFormation = async () => {
      if (!homeTeamId) return; // homeTeamId가 없으면 함수를 실행하지 않음

      try {
        const response = await axios.get(
          `http://localhost:3001/api/formation/${homeTeamId}/${matchId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Bearer 토큰 추가
            },
          }
        );
        const formation: FormationItem[] = response.data?.data;

        const newFormationInfo = formation.map((item: FormationItem) => ({
          id: item.id,
          name: item.member.user.name,
          position: item.position,
        }));

        console.log("newFormationInfo why:", newFormationInfo);

        formation.map((item: FormationItem) =>
          setPosition(item.position, item.member.user.name)
        );

        if (formation.length > 0 && formation[0].formation.length > 0) {
          setCurrentFormation(formation[0].formation);
        }

        setFormationInfo(newFormationInfo);

        console.log("newFormationInfo:", newFormationInfo);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };

    getTeamFormation();
  }, [homeTeamId]);

  const [modalData, setModalData] = useState<SimplifiedMemberInfo[]>([]);

  interface User {
    name: string; // 사용자의 이름
  }

  interface MatchFormation {
    position: string; // 포메이션의 포지션
  }

  interface Member {
    id: number; // 멤버의 ID
    user: User; // 멤버와 연관된 사용자 정보
    matchformation: MatchFormation[]; // 매치 포메이션 정보
  }

  interface SimplifiedMemberInfo {
    id: number; // 멤버 ID
    name: string; // 사용자 이름
    position: string; // 매치 포메이션의 포지션
  }

  useEffect(() => {
    // 모달창에서 멤버 목록 조회
    const getTeamFormation = async () => {
      if (!homeTeamId) return; // homeTeamId가 없으면 함수를 실행하지 않음

      try {
        const response = await axios.get(
          `http://localhost:3001/api/team/${homeTeamId}/members`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Bearer 토큰 추가
            },
          }
        );
        const members: Member[] = response.data?.data;

        const newModalData = members.map((member: Member) => {
          const position =
            member.matchformation.length > 0
              ? member.matchformation[0].position
              : "";
          return {
            id: member.id,
            name: member.user.name,
            position: position,
          };
        });

        setModalData(newModalData);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };

    getTeamFormation();
  }, [homeTeamId]);

  const setPosition = (position: string, playerName: string) => {
    setSelectedPlayerNames((prevNames) => ({
      ...prevNames,
      [position]: playerName,
    }));
    handleSelectPlayer(playerName);
  };

  // 이미지의 ref를 생성합니다.
  const fieldRef = useRef<HTMLImageElement>(null);

  // 드래그 가능한 경계를 설정하는 state입니다.
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });

  useEffect(() => {
    // 이미지 로드 완료 시 경계값 계산

    if (fieldRef.current) {
      // 이미 로드된 이미지라면 바로 경계값 업데이트
      updateBounds();
    }

    // 이미지 로드 이벤트 리스너 등록
    const imageElement = fieldRef.current;
    if (imageElement) {
      imageElement.addEventListener("load", updateBounds);
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      if (imageElement) {
        imageElement.removeEventListener("load", updateBounds);
      }
    };
  }, []);

  // ImageContainer의 참조를 생성합니다.
  const imageContainerRef = useRef<HTMLImageElement>(null);

  // 경계값을 계산하는 함수를 수정합니다.
  const updateBounds = () => {
    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      setBounds({
        left: rect.left,
        top: rect.top,
        right: rect.width,
        bottom: rect.height,
      });
    }
  };

  // 현재 선택된 포메이션을 상태로 관리
  const [currentFormation, setCurrentFormation] = useState("4-3-3");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<{
    [key: string]: string;
  }>({});

  console.log("selectedPlayerNames:", selectedPlayerNames);

  const handleClickOnPlayer = (player: Player) => {
    setSelectedPlayer(player);
    //etSelectedPlayerName(player.name);
    handleOpenModal();
  };

  const handleSelectPlayer = (playerName: string) => {
    if (selectedPlayer) {
      const playerCount = Object.keys(selectedPlayerNames).length;

      if (playerCount >= 11) {
        alert("최대 11명의 선수만 등록할 수 있습니다.");
        return;
      }

      if (Object.values(selectedPlayerNames).includes(playerName)) {
        alert("이미 선택된 선수입니다.");
      } else {
        setSelectedPlayerNames((prevNames) => ({
          ...prevNames,
          [selectedPlayer.name]: playerName,
        }));
      }
    }
    setShowModal(false);
  };

  // 콤보박스에서 선택된 포메이션에 따라 Player 컴포넌트를 렌더링하는 함수
  const renderFormation = (formationName: string) => {
    const formationData = formations[formationName];
    return (
      <>
        {formationData.attackers.map((pos, index) => (
          <Draggable bounds={bounds} key={`attacker-${index}`}>
            <Player
              style={{ left: pos.x, top: pos.y }}
              onClick={() =>
                handleClickOnPlayer({
                  name: formationData.positionNames.attackers[index],
                  position: formationData.positionNames.attackers[index],
                  id: index,
                })
              }>
              {selectedPlayerNames[
                formationData.positionNames.attackers[index]
              ] ? (
                <>
                  {formationData.positionNames.attackers[index]}
                  <br />
                  {
                    selectedPlayerNames[
                      formationData.positionNames.attackers[index]
                    ]
                  }
                </>
              ) : (
                formationData.positionNames.attackers[index]
              )}
            </Player>
          </Draggable>
        ))}
        {formationData.midfielders.map((pos, index) => (
          <Draggable bounds={bounds} key={`midfielder-${index}`}>
            <Player
              style={{ left: pos.x, top: pos.y }}
              onClick={() =>
                handleClickOnPlayer({
                  name: formationData.positionNames.midfielders[index],
                  position: formationData.positionNames.midfielders[index],
                  id: index,
                })
              }>
              {selectedPlayerNames[
                formationData.positionNames.midfielders[index]
              ] ? (
                <>
                  {formationData.positionNames.midfielders[index]}
                  <br />
                  {
                    selectedPlayerNames[
                      formationData.positionNames.midfielders[index]
                    ]
                  }
                </>
              ) : (
                formationData.positionNames.midfielders[index]
              )}
            </Player>
          </Draggable>
        ))}
        {formationData.defenders.map((pos, index) => (
          <Draggable bounds={bounds} key={`defender-${index}`}>
            <Player
              style={{ left: pos.x, top: pos.y }}
              onClick={() =>
                handleClickOnPlayer({
                  name: formationData.positionNames.defenders[index],
                  position: formationData.positionNames.defenders[index],
                  id: index,
                })
              }>
              {selectedPlayerNames[
                formationData.positionNames.defenders[index]
              ] ? (
                <>
                  {formationData.positionNames.defenders[index]}
                  <br />
                  {
                    selectedPlayerNames[
                      formationData.positionNames.defenders[index]
                    ]
                  }
                </>
              ) : (
                formationData.positionNames.defenders[index]
              )}
            </Player>
          </Draggable>
        ))}
        <Draggable bounds={bounds} key="goalkeeper">
          <Player
            style={{
              left: formationData.goalkeeper.x,
              top: formationData.goalkeeper.y,
            }}
            onClick={() =>
              handleClickOnPlayer({
                name: formationData.positionNames.goalkeeper,
                position: formationData.positionNames.goalkeeper,
                id: 1,
              })
            }>
            {selectedPlayerNames[formationData.positionNames.goalkeeper] ? (
              <>
                {formationData.positionNames.goalkeeper}
                <br />
                {selectedPlayerNames[formationData.positionNames.goalkeeper]}
              </>
            ) : (
              formationData.positionNames.goalkeeper
            )}
          </Player>
        </Draggable>
      </>
    );
  };

  // Player 타입 정의
  interface Player {
    id: number;
    name: string;
    position: string;
  }

  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);

  const handleDragStart = (player: Player) => {
    setDraggedPlayer(player);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    position: string
  ) => {
    event.preventDefault();
    // 드롭 영역에 선수 이름 추가하는 로직
    // 예: setFormationData({...formationData, [position]: draggedPlayer.name});

    if (draggedPlayer) {
      updatePlayerPosition(draggedPlayer, position);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // 드롭 이벤트를 허용하도록 기본 동작 방지
  };

  const updatePlayerPosition = (player: Player, position: string) => {
    // 포메이션 데이터 업데이트 로직
    // 예: setFormationData({...formationData, [position]: `${position} - ${player.name}`});
  };

  // 모달창 상태 추가
  const [showModal, setShowModal] = useState(false);

  // 모달창을 여는 함수
  const handleOpenModal = () => {
    setShowModal(true);
  };

  // 모달창을 닫는 함수
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // 모달창 렌더링 함수
  const renderModal = () => (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>전체 선수 명단</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul>
          {modalData.map((member) => (
            <li key={member.id} onClick={() => handleSelectPlayer(member.name)}>
              {member.name} - {member.position}
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );

  // PlayerPosition 타입 정의
  interface PlayerPosition {
    id: number;
    name: string;
    position: string;
  }

  // DTO 인터페이스 정의
  interface SaveFormationDto {
    playerPositions: PlayerPosition[];
    currentFormation: string;
  }

  // 저장
  const handleSaveButtonClick = async () => {
    let newPlayerPositions = [];

    //if (playerPositions.length===0) {
    const count = Object.keys(selectedPlayerNames).length;

    // 선수 포지션 미입력 시
    if (count === 0) {
      alert("멤버별 포지션을 지정하세요");
      return;
    }

    for (const position of Object.keys(selectedPlayerNames)) {
      const playerName = selectedPlayerNames[position];
      const playerInfo = modalData.find((member) => member.name === playerName);

      if (playerInfo) {
        newPlayerPositions.push({
          id: playerInfo.id,
          name: playerName,
          position: position,
        });
      }
    }

    console.log("newPlayerPositions:", newPlayerPositions);
    setFormationInfo(newPlayerPositions);
    // playerPositions 업데이트
    //fillPlayerPositions();

    //}

    // 상태 업데이트가 완료되기를 기다립니다.
    await new Promise((resolve) => setTimeout(resolve, 0));

    console.log("----------save-----------");
    console.log("selectedPlayerNames:", selectedPlayerNames);
    console.log("playerPositions:", playerPositions);
    console.log("playerPositions:", playerPositions.length);
    console.log("currentFormation:", currentFormation);

    // confirm 대화 상자를 사용하여 사용자 확인 요청
    if (window.confirm(`포메이션 및 포지션 정보 저장하시겠습니까?`)) {
      const data: SaveFormationDto = {
        playerPositions: newPlayerPositions,
        currentFormation: currentFormation,
      };

      console.log("confirm data:", data);

      try {
        if (playerPositions.length === 0) {
          await fillPlayerPositions();
        }

        await saveFormation(data);
        // 성공적으로 저장 후 처리
        // 예: navigate("/home");
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }

      // saveFormation({
      //   playerPositions: playerPositions,
      //   currentFormation: currentFormation
      // });
    }
  };

  const saveFormation = async (data: SaveFormationDto) => {
    try {
      await axios.post(
        `http://localhost:3001/api/formation/${homeTeamId}/${matchId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("data:", data);

        // API 호출 성공 시
        alert("포메이션 및 포지션 정보 저장되었습니다.");
        // navigate("/home"); // 여기서 "/home"은 홈 페이지의 경로입니다.

        window.location.reload();

      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };  

  const fillPlayerPositions = async () => {
    const newPlayerPositions = [];

    for (const position in selectedPlayerNames) {
      if (selectedPlayerNames.hasOwnProperty(position)) {
        const playerName = selectedPlayerNames[position];

        // modalData에서 해당 선수 찾기
        const playerInfo = modalData.find(
          (member) => member.name === playerName
        );

        if (playerInfo) {
          newPlayerPositions.push({
            id: playerInfo.id,
            name: playerName,
            position: position,
          });
        }
      }
    }

    setFormationInfo(newPlayerPositions);

    console.log("playerPositions:", playerPositions);
  };

    // 초기화 함수
    const handleResetSelection = () => {
      setSelectedPlayerNames({});
    };

    function getPositionsByFormation(formationName: string): string[] {
      // 주어진 포메이션명에 해당하는 포메이션 객체를 찾음
      const formation = formations[formationName];
    
      if (!formation) {
        throw new Error(`Formation "${formationName}" not found`);
      }
    
      // 각 포지션의 이름들을 추출하여 하나의 배열로 결합
      const positions = [
        ...formation.positionNames.defenders,
        ...formation.positionNames.midfielders,
        ...formation.positionNames.attackers,
        formation.positionNames.goalkeeper
      ];
    
      return positions;
    }

    const positions = getPositionsByFormation(currentFormation);

    const PlayerListItem = styled.li`
        // ... 기존 스타일링 유지
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px; // 좌우 여백 추가
        border-bottom: 1px solid #ddd; // 하단에 경계선을 추가합니다.
        &:hover {
          background-color: #f0f0f0; // 마우스 호버 시 배경색을 변경합니다.
        }
      
        > div:first-child {
          margin-right: auto; // 첫 번째 자식 div(텍스트를 감싼 div)에 오른쪽 여백을 자동으로 설정하여 나머지 요소들을 오른쪽으로 밀어냅니다.
        }
    `;

    // Dropdown 컴포넌트를 스타일링합니다.
    const StyledDropdown = styled(Dropdown)`
    margin-left: 16px; // 드롭다운과 텍스트 사이의 간격을 설정합니다.
    `;

  type onSelectPositionType = (playerId: number, newPosition: string) => void;

  interface PlayerDropdownProps {
    player: Player;
    onSelectPosition: onSelectPositionType;
  }

    // PlayerListItem 내부에 드롭다운을 추가하는 컴포넌트
    const PlayerDropdown: React.FC<PlayerDropdownProps>  = ({ player, onSelectPosition }) => {

      const handlePositionSelect = (newPosition: string) => {
        // 선택한 포지션을 onSelectPosition 함수를 통해 부모 컴포넌트로 전달합니다.

        const playerCount = Object.keys(selectedPlayerNames).length;

        if (playerCount >= 11) {
            alert('최대 11명의 선수만 등록할 수 있습니다.');
            return;
        }

        if (Object.values(selectedPlayerNames).includes(player.name)){

          alert('이미 선택된 선수입니다.');

        }else{
          onSelectPosition(player.id, newPosition);
        }
        
      };

        return (
          <StyledDropdown>
            <Dropdown>
              <Dropdown.Toggle variant="success" id={`dropdown-${player.id}`}>
                  {"포지션"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                  {positions.map((pos) => (
                      <Dropdown.Item
                          key={pos}
                          onClick={() => handlePositionSelect(pos)}
                      >
                          {pos}
                      </Dropdown.Item>
                  ))}
              </Dropdown.Menu>
          </Dropdown>
          </StyledDropdown>

        );
  };

  // 선수 포지션 변경 처리 함수
  const handleSelectPosition = (playerId: number, newPosition: string) => {
    // playerPositions 상태를 업데이트하여 선수의 포지션 변경
    setFormationInfo((prevPositions) =>
      prevPositions.map((player) =>
        player.id === playerId ? { ...player, position: newPosition } : player
      )
    );

    // selectedPlayerNames 상태를 업데이트하여 선택한 포지션 정보 추가
    setSelectedPlayerNames((prevNames) => ({
      ...prevNames,
      [newPosition]: modalData.find((player) => player.id === playerId)?.name || ""
    }));
  };

    // 전술의 장점과 단점 데이터를 상태로 관리하거나 고정 데이터로 설정할 수 있습니다.
    const tacticalAdvantages = [
      "공격적인 포메이션으로, 세 명의 전방 공격수가 강력한 공격력을 발휘할 수 있습니다.",
      "네 명의 미드필더가 중앙과 측면을 넓게 커버하며, 상대 팀의 공격을 빠르게 차단할 수 있습니다.",
      "수비 시에는 중앙 미드필더가 뒤로 내려와 수비수를 지원하여 5명의 수비 라인을 형성할 수 있습니다."
    ];
  
    const tacticalDisadvantages = [
      "수비수 세 명만이 후방을 담당하기 때문에, 상대의 측면 공격에 취약할 수 있습니다.",
      "미드필더와 수비수 사이의 간격이 멀어, 상대에게 공간을 제공할 위험이 있습니다.",
      "중앙 미드필더가 수비적인 역할을 소화해야 하며, 이를 소화하지 못할 경우 수비에 구멍이 생길 수 있습니다."
    ];

    interface FormationAdvantagesDisadvantages {
      advantages: string[];
      disadvantages: string[];
    }

  const [formationDetails, setFormationDetails] = useState<FormationAdvantagesDisadvantages>({
    advantages: [],
    disadvantages: []
  });

  // 현재 선택된 포메이션의 장점과 단점을 설정하는 함수
  const setFormationDetailsFromName = (formationName: string) => {
    const formation = formations[formationName];
    setFormationDetails({
      advantages: formation.advantages,
      disadvantages: formation.disadvantages
    });
  };

  // 포메이션 상태가 변경될 때마다 장점과 단점을 업데이트합니다.
  useEffect(() => {
    setFormationDetailsFromName(currentFormation);
  }, [currentFormation]);

  return (
    <Layout>
      <TripleContainer>
        <div>
          <Sidebar>
            {/* 콤보박스 렌더링 */}
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                포메이션 선택 <span>{currentFormation}</span>
              </Dropdown.Toggle>
              <Button onClick={handleResetSelection}>초기화</Button>
              <Button onClick={handleSaveButtonClick}>저장</Button>
              <Dropdown.Menu>
                {Object.keys(formations).map((formationName) => (
                  <Dropdown.Item
                    key={formationName}
                    onClick={() => {
                      setCurrentFormation(formationName);
                    }}>
                    {formationName}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          <ImageContainer ref={imageContainerRef}>
            {/* 선택된 포메이션 렌더링 */}
            {renderFormation(currentFormation)}
          </ImageContainer>
        </Sidebar>
        <PlayerList>
          <h3>선수명단</h3>
            {modalData.map(player => (
                <PlayerListItem key={player.id}>
                {`${player.name} ${player.position}`}
                <PlayerDropdown
                  player={player}
                  onSelectPosition={handleSelectPosition}
                />
              </PlayerListItem>
            ))}
        </PlayerList>
      </div>
      <div>
          <RightContainer>
              <h2 style={{marginTop:"20px"}}>전술 소개</h2>
            <TacticalAdvantages>
              {formationDetails.advantages.map((advantage, index) => (
                <TacticalPoint key={`advantage-${index}`}><b>장점</b> : {advantage}</TacticalPoint>
              ))}
            </TacticalAdvantages>
            <TacticalDisadvantages>
              {formationDetails.disadvantages.map((disadvantage, index) => (
                <TacticalWeakness key={`disadvantage-${index}`}><b>단점</b> : {disadvantage}</TacticalWeakness>
              ))}
            </TacticalDisadvantages>
            <h3>추천 포메이션?</h3>
            <h3>인기 포메이션?</h3>
            <h3>해당 포메이션으로 승리한 확률</h3>
          </RightContainer>
      </div>
    </TripleContainer>
    {renderModal()}
    </Layout>
  );
};

export default Formation;
