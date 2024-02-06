import Layout from "layouts/App";
import styled from "styled-components";
import React, { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // 날짜 선택기 스타일
import { ko } from "date-fns/locale";
import { format, isMatch } from "date-fns";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

const responsiveWidth = "768px";

const DatePickerContainer = styled.div`
  display: flex;
  justify-content: center; // 가운데 정렬
  align-items: center; // 세로 방향 가운데 정렬
  width: 95%; // 화면 너비에 맞춤
  padding: 10px; // 달력 주변에 여유 공간 추가
  margin: 0 0 -50px 0;

  .react-datepicker {
    width: 100%; // 너비 전체 사용
    font-size: 3em;

    border: 2px solid #d6d6d6; // DatePicker 테두리 색상
    border-radius: 10px; // 테두리 모서리 둥글게
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); // 그림자 추가
  }

  .react-datepicker__header {
    background-color: #f8f9fa; // 배경 테마와 비슷한 색상
    padding: 2px 0;
    font-weight: bold;

    // ... 기타 스타일 ...
  }

  .react-datepicker__month-container {
    width: 100%; // 달력 뒤 배경의 너비를 100%로 설정
  }

  .react-datepicker__day {
    margin: 0 2px 0 2px;
    width: 13%;
    color: #333; // 텍스트 색상 조정
    font-size: 19px; // 폰트 크기 조정
    border: 1px solid #d6d6d6; // 테두리 추가
    border-radius: 10px; // 테두리 모서리 둥글게
  }

  // 날짜에 마우스를 올렸을 때 테두리 색상 변경 (옵션)
  .react-datepicker__day:hover {
    border-color: #007bff; // 마우스 호버 시 테두리 색상 변경
    transform: scale(1.02);
  }

  // 선택된 날짜의 스타일
  .react-datepicker__day--selected {
    border-color: #007bff; // 선택된 날짜의 테두리 색상
    background-color: #ffffff; // 선택된 날짜의 배경 색상
    color: black; // 선택된 날짜의 글자 색상
  }

  // 다른 달의 날짜에 대한 스타일
  .react-datepicker__day--outside-month {
    color: #ccc; // 다른 달의 날짜 글자 색상
  }

  .react-datepicker__day-name {
    width: 13%;
    height: 0px;
    margin: -80px 0 0 0;
    font-size: 20px;
  }

  .react-datepicker__current-month {
    font-size: 0.5em;
  }

  .react-datepicker__week {
    margin: -26px 0 20px 0; // 각 주의 상하 마진을 조절하여 간격을 줄입니다.
  }

  /* day: 주말 날짜 */
  .react-datepicker__day:nth-child(1) {
    color: red; /* 일요일 날짜*/
  }
  .react-datepicker__day:nth-child(7) {
    color: blue; /* 토요일 날짜 */
  }

  /* day-name: 요일 */
  .react-datepicker__day-name:nth-child(1) {
    color: #ff5555; /* 일요일 */
  }
  .react-datepicker__day-name:nth-child(7) {
    color: blue; /* 토요일 */
  }

  // 이전 날짜의 글씨를 흐리게 하는 스타일
  .react-datepicker__day--disabled {
    opacity: 0.5; // 흐리게 표시
  }

  // 여기에 더 많은 커스텀 스타일을 추가할 수 있습니다.
`;

const MatchCalendar = () => {
  const navigate = useNavigate();

  const [teamId, setTeamId] = useState<number | undefined>();
  const [startDate, setStartDate] = useState(new Date());
  const [eventDates, setEventDates] = useState<EventDates>({});
  const [schedules, setScheldules] = useState<schelduleInfo[]>([]);

  const accessToken = localStorage.getItem("accessToken");
  useEffect(() => {
    // 멤버 정보 가져오는 함수
    const getMember = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}:${
            process.env.REACT_APP_SERVER_PORT || 3000
          }/api/match/member`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Bearer 토큰 추가
            },
          }
        );
        const getTeamId = response.data.data.team.id;
        setTeamId(getTeamId);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };

    getMember(); // 데이터를 불러오는 함수 호출
  }, []);

  useEffect(() => {
    // teamId 상태가 설정되면 스케줄을 가져옵니다.
    if (teamId) {
      getScheldule(); // 이 함수는 teamId가 설정된 후에 호출됩니다.
    }
  }, [teamId]);

  // 날짜와 이미지 URL을 매핑하는 인터페이스
  interface EventDates {
    [key: string]: string;
  }

  interface schelduleInfo {
    field_name: string;
    name: string;
    date: string;
    time: string;
    matchId: number;
  }

  const [selectedMatchId, setSelectedMatchId] = useState<number>(0);

  const getScheldule = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/match/team/schedule/` + teamId,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Bearer 토큰 추가
          },
        }
      );
      const resultTeam = response.data.data;
      if (Array.isArray(resultTeam)) {
        // resultTeam 배열을 이용해 dropdownItems 배열 생성
        const newEventDates = resultTeam.reduce((acc, team) => {
          acc[team.date] = team.imageUrl;
          return acc;
        }, {});

        const newSchelduleInfo = resultTeam.map((team) => ({
          field_name: team.field_name,
          name: team.name,
          date: team.date,
          time: team.time,
          matchId: team.match_id,
        }));

        setEventDates(newEventDates); // 상태 업데이트
        setScheldules(newSchelduleInfo);
      }
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
    }
  };
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>("");

  const fetchMatchResult = async (matchId: number) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/match/${matchId}/result/exist`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Bearer 토큰 추가
          },
        }
      );
      const result = response.data.data;
      return result;
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
    }
  };

  const [isMatchEnd, setIsMatchEnd] = useState<boolean>(false);
  const handleDayClick = async (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    const isMatchEnd = await fetchMatchResult(selectedMatchId);
    isMatchEnd ? setIsMatchEnd(true) : setIsMatchEnd(false);

    // 선택된 날짜에 해당하는 스케줄 찾기
    const daySchedules = schedules.filter((sch) => sch.date === formattedDate);

    // 선택된 날짜에 해당하는 첫 번째 스케줄의 matchId를 저장
    if (daySchedules.length > 0) {
      setSelectedMatchId(daySchedules[0].matchId); // matchId를 상태에 저장
    }

    // 모달 내용 구성
    const scheduleContent = daySchedules.map((sch) => (
      <div key={sch.date}>
        <p>팀 이름: {sch.name}</p>
        <p>일자: {sch.date}</p>
        <p>시간: {sch.time}</p>
        <p>장소: {sch.field_name}</p>
      </div>
    ));

    setModalContent(
      <div>
        {scheduleContent.length > 0 ? (
          scheduleContent
        ) : (
          <p>이 날짜에는 예정된 경기가 없습니다.</p>
        )}
      </div>
    );

    setShowModal(true);
  };

  // 전술 설정 페이지로 이동하는 함수
  const handleTacticSetting = () => {
    navigate("/match/formation/", { state: { matchId: selectedMatchId } }); // matchId를 URL에 포함하여 페이지 이동
  };

  const handleCloseModal = () => setShowModal(false);

  // 달력 내 각 날짜의 내용을 렌더링하는 함수입니다.
  const renderDayContents = (day: number, date: Date): JSX.Element => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const imageUrl = eventDates[formattedDate];

    return (
      <div
        onClick={() => handleDayClick(date)}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: "90px",
        }}
      >
        <span style={{ margin: "0 0 0 10px", alignSelf: "flex-start" }}>
          {day}
        </span>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Event"
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div style={{ width: "50px", height: "50px", margin: "0 auto" }} /> // 이미지가 없을 때를 위한 빈 공간
        )}
      </div>
    );
  };

  // 이전 날짜를 비활성화하기 위한 함수
  const isPastDate = (date: Date) => {
    // '오늘 날짜'의 시작부터 비교하려면 오늘 날짜를 0시 0분 0초로 설정해야 합니다.
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작으로 설정

    // date가 '오늘 날짜의 시작'과 같거나 이후이면 false를 반환 (활성화)
    return date < today;
  };

  const handleMatchPreview = () => {
    navigate("/match/preview", { state: { matchId: selectedMatchId } });
  };

  const handleMatchReview = () => {
    navigate("/match/result", { state: { matchId: selectedMatchId } });
  };

  return (
    <Layout>
      <h3>경기 일정</h3>
      <DatePickerContainer>
        <DatePicker
          selected={startDate}
          className="custom-datepicker"
          locale={ko}
          inline
          onChange={(date: Date) => setStartDate(date)}
          renderDayContents={renderDayContents}
        />
      </DatePickerContainer>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>일정 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleMatchPreview}>
            매치 정보
          </Button>
          <Button variant="primary" onClick={handleTacticSetting}>
            전술 설정
          </Button>
          <Button variant="secondary" onClick={handleCloseModal}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default MatchCalendar;
