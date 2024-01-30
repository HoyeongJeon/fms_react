// PlayerInputRow 컴포넌트
// Props 타입 정의

import styled from "styled-components";

interface PlayerInfo {
  id: number;
  name: string;
  goal: number;
  assist: number;
  yellowCards: number;
  redCards: number;
  saves: number;
}

interface PlayerInputRowProps {
  player: PlayerInfo;
  onPlayerChange: (
    playerId: number,
    field: keyof PlayerInfo,
    value: string
  ) => void;
}

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 0;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const PlayerInputRow: React.FC<PlayerInputRowProps> = ({
  player,
  onPlayerChange,
}) => {
  return (
    <tr>
      <td>
        <Input
          type="text"
          value={player.name}
          placeholder="선수 이름을 입력하세요."
          onChange={(e) => onPlayerChange(player.id, "name", e.target.value)}
        />
      </td>
      <td>
        <Input
          type="number"
          value={player.goal}
          placeholder="득점 수를 입력해주세요"
          onChange={(e) => onPlayerChange(player.id, "goal", e.target.value)}
        />
      </td>
      <td>
        <Input
          type="number"
          value={player.assist}
          onChange={(e) => onPlayerChange(player.id, "assist", e.target.value)}
        />
      </td>
      <td>
        <Input
          type="number"
          value={player.yellowCards}
          onChange={(e) =>
            onPlayerChange(player.id, "yellowCards", e.target.value)
          }
        />
      </td>
      <td>
        <Input
          type="number"
          value={player.redCards}
          onChange={(e) =>
            onPlayerChange(player.id, "redCards", e.target.value)
          }
        />
      </td>
      <td>
        <Input
          type="number"
          value={player.saves}
          onChange={(e) => onPlayerChange(player.id, "saves", e.target.value)}
        />
      </td>
    </tr>
  );
};

export default PlayerInputRow;
