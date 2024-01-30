// 의문?
// 화면에서 여기 왜 등록하는지?
// 경기 종료 버튼?

import axios from "axios";
import Layout from "layouts/App";
import {
  NextButton,
  ScoreInput,
  ScoreboardContainer,
  TeamBadge,
  TeamLogo,
  TeamsContainer,
  Title,
} from "pages/MatchResult/styles";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTeamStore } from "store/teamStore";
import { useUserStore } from "store/userStore";
import { Input, Typography, Button, Flex } from "antd";
import useSWR from "swr";
import fetcher from "utils/fetcher";
const { Text, Link } = Typography;
//

interface MatchInfo {
  cornerKick: number;
  freeKick: number;
  penaltyKick: number;
  passes: number;
}

interface Substitution {
  in: string;
  out: string;
}

interface Member {
  memberId: number;
  name: string;
}

const InputMatchResult = () => {
  const [homeScore, setHomeScore] = useState(0);
  const { matchId } = useParams();
  const { teamId, name, imageUUID } = useTeamStore();
  const { data: memberData, error } = useSWR(`/team/${teamId}/member`, fetcher); // 이친구가 요청을 보내줌
  const { data: presignedURL } = useSWR(`/image/${imageUUID}`, fetcher);
  const { id: userId } = useUserStore();
  const navigate = useNavigate();
  const [matchInfo, setMatchInfo] = useState<MatchInfo>({
    cornerKick: 0,
    freeKick: 0,
    penaltyKick: 0,
    passes: 0,
  });

  const [substitution, setSubstitution] = useState<Substitution[]>([
    { in: "", out: "" },
    { in: "", out: "" },
    { in: "", out: "" },
  ]);

  const getPlayerIdByName = (
    name: string,
    members: Member[]
  ): number | null => {
    const player = members.find((member) => member.name === name);
    return player ? player.memberId : null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMatchInfo(() => {
      return {
        ...matchInfo,
        [name]: value,
      };
    });
  };

  const handleSubstitutionChange = (
    index: number,
    field: "in" | "out",
    value: string
  ) => {
    setSubstitution((currentSubstitution) => {
      const newSubstitution = [...currentSubstitution];
      newSubstitution[index][field] = value;
      return newSubstitution;
    });
  };

  const clearSubstitutionInputs = () => {
    setSubstitution(substitution.map(() => ({ in: "", out: "" })));
  };

  const handleNext = async () => {
    const substitutionsWithIds = substitution.map((sub) => ({
      in: sub.in,
      out: sub.out,
      inPlayerId: getPlayerIdByName(sub.in, memberData?.data || []),
      outPlayerId: getPlayerIdByName(sub.out, memberData?.data || []),
    }));

    // 유효하지 않은 교체 선수가 있는지 확인합니다.
    const invalidSubstitution = substitutionsWithIds.find(
      (sub) =>
        (sub.in !== "" && !sub.inPlayerId) ||
        (sub.out !== "" && !sub.outPlayerId)
    );

    // 유효하지 않은 교체 선수가 있으면 오류 메시지를 표시하고 처리를 중지합니다.
    if (invalidSubstitution) {
      if (invalidSubstitution.in !== "" && !invalidSubstitution.inPlayerId) {
        alert(
          `팀에 속해있지 않는 선수 '${invalidSubstitution.in}'는 교체할 수 없습니다.`
        );
      } else if (
        invalidSubstitution.out !== "" &&
        !invalidSubstitution.outPlayerId
      ) {
        alert(
          `팀에 속해있지 않는 선수 '${invalidSubstitution.out}'는 교체할 수 없습니다.`
        );
      }
      clearSubstitutionInputs();
      return;
    }

    // 유효한 교체 선수 목록만 서버로 전송할 데이터에 포함합니다.
    const validSubstitutions = substitutionsWithIds
      .filter((sub) => sub.inPlayerId && sub.outPlayerId)
      .map(({ inPlayerId, outPlayerId }) => ({ inPlayerId, outPlayerId }));

    // matchInfo 객체에 substitutions 키를 추가하여 서버의 형식에 맞게 조합
    const dataToSend = {
      ...matchInfo,
      ...(validSubstitutions.length > 0 && {
        substitutions: JSON.stringify(validSubstitutions),
      }),
    };
    try {
      //const response = await axios.post("/api/match-result", dataToSend);
      // 성공적으로 전송되면 다음 페이지로 이동
      navigate(`/match/${matchId}/input/detail`);
    } catch (error) {
      console.error("Error sending match result data", error);
    }
  };

  return (
    <Layout>
      <ScoreboardContainer>
        <Title>XX년 XX월 XX일 (경기장 이름) MatchID {matchId}</Title>
        <TeamsContainer>
          <TeamBadge>
            <TeamLogo src={presignedURL} alt="작성자가 속한 팀 로고 넣어야함" />
            <div>{name}</div>
          </TeamBadge>

          {/* <ScoreInput
            type="text"
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
          /> */}
        </TeamsContainer>

        {Object.keys(matchInfo).map((record) => {
          if (
            record === "cornerKick" ||
            record === "freeKick" ||
            record === "penaltyKick" ||
            record === "passes"
          ) {
            return (
              <>
                <Text>{record}</Text>
                <Input
                  key={record}
                  name={record}
                  placeholder="숫자를 입력해주세요(e.g 1, 2, 3)"
                  type="number"
                  onChange={handleChange}
                  value={matchInfo[record]}
                />
              </>
            );
          }
        })}
        <>
          <br />
          <Text>교체 1</Text>
          <Input
            placeholder="교체로 들어간 선수를 입력해주세요"
            type="string"
            name={"in"}
            onChange={(e) => handleSubstitutionChange(0, "in", e.target.value)}
            value={substitution[0].in}
          />
          <Input
            placeholder="교체로 나온 선수를 입력해주세요"
            type="string"
            name={"out"}
            onChange={(e) => handleSubstitutionChange(0, "out", e.target.value)}
            value={substitution[0].out}
          />
          <br />
          <Text>교체 2</Text>
          <Input
            placeholder="교체로 들어간 선수를 입력해주세요"
            type="string"
            name={"in"}
            onChange={(e) => handleSubstitutionChange(1, "in", e.target.value)}
            value={substitution[1].in}
          />
          <Input
            placeholder="교체로 나온 선수를 입력해주세요"
            type="string"
            name={"out"}
            onChange={(e) => handleSubstitutionChange(1, "out", e.target.value)}
            value={substitution[1].out}
          />
          <br />
          <Text>교체 3</Text>
          <Input
            placeholder="교체로 들어간 선수를 입력해주세요"
            type="string"
            name={"in"}
            onChange={(e) => handleSubstitutionChange(2, "in", e.target.value)}
            value={substitution[2].in}
          />
          <Input
            placeholder="교체로 나온 선수를 입력해주세요"
            type="string"
            name={"out"}
            onChange={(e) => handleSubstitutionChange(2, "out", e.target.value)}
            value={substitution[2].out}
          />
          <br />
        </>
        <NextButton onClick={handleNext}>Next</NextButton>
      </ScoreboardContainer>
    </Layout>
  );
};

export default InputMatchResult;
