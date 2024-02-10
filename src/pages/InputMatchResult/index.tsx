import axios from "axios";
import Layout from "layouts/App";
import {
  NextButton,
  ScoreInput,
  ScoreboardContainer,
  TeamBadge,
  TeamLogo,
  TeamsContainer,
} from "pages/MatchResult/styles";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTeamStore } from "store/teamStore";
import { useUserStore } from "store/userStore";
import { Input, Typography, InputNumber } from "antd";
import useSWR from "swr";
import fetcher from "utils/fetcher";
import { BASE_URL } from "utils/axios";
import { useMemberStore } from "store/memberStore";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { BiFootball } from "react-icons/bi";
import dayjs from "dayjs";
const { Title, Text } = Typography;

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
  const location = useLocation();
  const { matchDate } = location.state || {};
  const { teamId, name, imageUUID } = useTeamStore();
  const { id: memberId } = useMemberStore();
  const { data: memberData, error } = useSWR(`/team/${teamId}/member`, fetcher); // 이친구가 요청을 보내줌x

  const [show, setShow] = useState(false);
  console.log("memberData", memberData);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
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
    if (!name) return null;
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
    const substitutionsWithIds = substitution
      .filter((sub) => sub.in || sub.out) // in과 out 중 하나라도 값이 있어야 처리
      .map((sub) => ({
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
      .filter((sub) => sub.in && sub.out && sub.inPlayerId && sub.outPlayerId)
      .map(({ inPlayerId, outPlayerId }) => ({ inPlayerId, outPlayerId }));

    const dataToSend = {
      ...matchInfo,
      ...(validSubstitutions.length > 0 && {
        substitions: validSubstitutions,
      }),
    };
    try {
      console.log("dataToSend", dataToSend);
      const response = await axios.post(
        `${BASE_URL}/match/${matchId}/result`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          withCredentials: true,
        }
      );
      console.log("response", response);

      navigate(`/match/${matchId}/input/detail`);
    } catch (error) {
      console.log(error);
    }
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
                // addPlayerByName(member);
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
        <Title level={3}>
          {matchDate ? dayjs(matchDate).format("YYYY-MM-DD") : "Loading..."}
        </Title>
        <TeamsContainer>
          <TeamBadge>
            <TeamLogo src={presignedURL} alt="작성자가 속한 팀 로고 넣어야함" />
            <div>{name}</div>
          </TeamBadge>
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
                  min={0}
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
