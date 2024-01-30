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

    const invalidSubstitution = substitutionsWithIds.find(
      (sub) =>
        (sub.in !== "" && !sub.inPlayerId) ||
        (sub.out !== "" && !sub.outPlayerId)
    );

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

    const validSubstitutions = substitutionsWithIds
      .filter((sub) => sub.inPlayerId && sub.outPlayerId)
      .map(({ inPlayerId, outPlayerId }) => ({ inPlayerId, outPlayerId }));

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
          {substitution.map((item, index) => (
            <div key={index}>
              <Text>교체 {index + 1}</Text>
              <Input
                placeholder="교체로 들어간 선수를 입력해주세요"
                type="string"
                name={"in"}
                onChange={(e) =>
                  handleSubstitutionChange(index, "in", e.target.value)
                }
                value={item.in}
              />
              <Input
                placeholder="교체로 나온 선수를 입력해주세요"
                type="string"
                name={"out"}
                onChange={(e) =>
                  handleSubstitutionChange(index, "out", e.target.value)
                }
                value={item.out}
              />
              <br />
            </div>
          ))}
        </>
        <NextButton onClick={handleNext}>Next</NextButton>
      </ScoreboardContainer>
    </Layout>
  );
};

export default InputMatchResult;
