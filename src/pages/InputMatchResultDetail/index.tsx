import Layout from "layouts/App";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTeamStore } from "store/teamStore";
import axios from "axios";
import PlayerInputRow from "components/PlayerInputRow";
import useSWR from "swr";
import fetcher from "utils/fetcher";
import {
  StyledButton,
  CustomButton,
  ScoreboardContainer,
  Table,
} from "./styles";
import { BiFootball } from "react-icons/bi";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { Space, Typography } from "antd";

const { Text, Link } = Typography;

interface PlayerInfo {
  id: number;
  name: string;
  goal: number;
  assist: number;
  yellowCards: number;
  redCards: number;
  saves: number;
}

interface Member {
  memberId: number;
  name: string;
}

interface TransformedPlayer {
  memberId: number | null;
  name: string;
  assists: number;
  goals: number;
  yellowCards: number;
  redCards: number;
  saves: number;
}

const InputMatchResultDetail = () => {
  const { matchId } = useParams();
  const { teamId } = useTeamStore();
  const { data: memberData, error } = useSWR(`/team/${teamId}/member`, fetcher);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navigate = useNavigate();

  const getPlayerIdByName = (
    name: string,
    members: Member[]
  ): number | null => {
    const player = members.find((member) => member.name === name);
    return player ? player.memberId : null;
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    const playersWithIds: TransformedPlayer[] = players.map((player) => ({
      name: player.name,
      memberId: getPlayerIdByName(player.name, memberData?.data || []),
      assists: player.assist,
      goals: player.goal,
      yellowCards: player.yellowCards,
      redCards: player.redCards,
      saves: player.saves,
    }));
    const validPlayers = playersWithIds.filter(
      (player) => player.memberId != null
    );

    // 존재하지 않는 선수 지워버림
    const nonExistingPlayers = playersWithIds.filter(
      (player) => player.memberId == null
    );

    // 존재하지 않는 선수를 찾아서 이름을 비워줌
    nonExistingPlayers.forEach((nonExistingPlayer) => {
      const playerToReset = players.find(
        (p) => p.name === nonExistingPlayer.name
      );
      if (playerToReset) {
        handlePlayerChange(playerToReset.id, "name", "");
      }
    });

    if (nonExistingPlayers.length > 0) {
      alert("팀에 존재하지 않는 선수입니다.");
      return;
    }

    const dataToSubmit = {
      results: validPlayers,
    };

    axios
      .post(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/result/member`,
        dataToSubmit
      )
      .then((res) => {
        console.log(res);
        navigate(`/team`);
      })
      .catch((err) => {
        alert("오류가 발생했습니다.");
        console.log(err);
        navigate(`/match/${matchId}`);
      });
  };

  const handlePlayerChange = (
    playerId: number,
    field: keyof PlayerInfo,
    value: string
  ) => {
    const newValue = field === "name" ? value : Number(value);
    setPlayers((currentPlayers) =>
      currentPlayers.map((player) =>
        player.id === playerId ? { ...player, [field]: newValue } : player
      )
    );
  };
  const addPlayer = () => {
    const newPlayerId = players[players.length - 1].id + 1;
    setPlayers([
      ...players,
      {
        id: newPlayerId,
        name: "",
        goal: 0,
        assist: 0,
        yellowCards: 0,
        redCards: 0,
        saves: 0,
      },
    ]);
  };

  const removePlayer = (playerId: number) => {
    setPlayers((currentPlayers) =>
      currentPlayers.filter((player) => player.id !== playerId)
    );
  };

  // 모달 클릭 시 선수 추가
  const addPlayerByName = (selectedMember: Member) => {
    if (players.some((player) => player.id === selectedMember.memberId)) {
      alert("이미 추가된 선수입니다.");
      return;
    }

    setPlayers((currentPlayers) => [
      ...currentPlayers,
      {
        id: selectedMember.memberId,
        name: selectedMember.name,
        goal: 0,
        assist: 0,
        yellowCards: 0,
        redCards: 0,
        saves: 0,
      },
    ]);
  };

  return (
    <Layout>
      <Button
        variant="
      outline-dark
      "
        onClick={handleShow}
      >
        선수 목록 <BiFootball />
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>선수 명단</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {memberData?.data.map((member: Member) => (
            <div
              key={member.memberId}
              onClick={() => {
                addPlayerByName(member);
                handleClose();
              }}
              style={{ cursor: "pointer", margin: "5px 0" }}
            >
              {member.name}
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-dark" onClick={handleClose}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
      <ScoreboardContainer>
        <Table>
          <thead>
            <tr>
              <th>이름</th>
              <th>골</th>
              <th>어시스트</th>
              <th>옐로우 카드</th>
              <th>레드 카드</th>
              <th>선방 횟수</th>
              <th>삭제</th>
            </tr>
          </thead>
        </Table>
        {/* <tbody
          style={{
            width: "100%",
          }}
        >
          {players.map((player) => (
            <>
              <tr key={player.id}>
                <PlayerInputRow
                  player={player}
                  onPlayerChange={handlePlayerChange}
                />
                <td>
                  <CustomButton onClick={() => removePlayer(player.id)}>
                    X
                  </CustomButton>
                </td>
              </tr>
            </>
          ))}
        </tbody> */}

        <tbody
          style={{
            width: "100%",
          }}
        >
          {players.length > 0 ? (
            players.map((player) => (
              <>
                <tr key={player.id}>
                  <PlayerInputRow
                    player={player}
                    onPlayerChange={handlePlayerChange}
                  />
                  <td>
                    <CustomButton onClick={() => removePlayer(player.id)}>
                      X
                    </CustomButton>
                  </td>
                </tr>
              </>
            ))
          ) : (
            <tr>
              <td colSpan={7}>
                <Text type="secondary">
                  선수 목록의 선수들을 클릭하여 추가해주세요.
                </Text>
              </td>
            </tr>
          )}
        </tbody>
        {/* <StyledButton onClick={addPlayer}>선수 추가</StyledButton> */}
        <StyledButton onClick={handleSubmit}>save</StyledButton>
      </ScoreboardContainer>
    </Layout>
  );
};

export default InputMatchResultDetail;
