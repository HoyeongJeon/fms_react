import Layout from "layouts/App";
import styled from 'styled-components';
import React, { useEffect,useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // 날짜 선택기 스타일
import { ko } from 'date-fns/locale';
import Dropdown from 'react-bootstrap/Dropdown';
import CustomDropdown from '../../../components/CustomDropdown';
import Alert from 'react-bootstrap/Alert';
import DraggableCircle from "components/DraggableCircle";


const responsiveWidth = '768px'; 

const Sidebar = styled.div`
    width: 100%;
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
    //border: 2px solid green; // 각 div의 테두리를 초록색으로 설정
    &:not(:last-child) {
        margin-right: 2px; // 오른쪽 div에만 여백을 추가하여 구분
    }
    }
`;

// 모든 자식 요소를 가운데 정렬하는 컨테이너 컴포넌트
const CenteredContainer = styled.div`
  display: flex;
  justify-content: center; // 가로 방향 중앙 정렬
  width: 100%; // 부모 컨테이너 너비에 맞춤
`;


const ImageContainer = styled.div`
  position: relative;
  height: auto; 
`;


const Image = styled.img`
  width: 55.5%;

  @media (max-width: ${responsiveWidth}) {
    width: 40%; // 화면이 작아지면 너비를 100%로 설정하여 가로로 꽉 차게 합니다.
  }
`;

const ReservationInfo = styled.div`
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #d6d6d6;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  height: auto; // 필요한 만큼 높이 자동 조정
`;

const ReservationTitle = styled.h2`
  font-weight: bold;
  margin-bottom: 20px; // 타이틀과 리스트 사이의 여백
  color: black;
`;

// TimeSlot 컴포넌트의 props 타입 정의
interface TimeSlotProps {
    selected: boolean;
  }


const TimeSlot = styled.div<TimeSlotProps>`
  padding: 13px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  background-color: ${props => props.selected ? '#32cd32' : 'transparent'};
  color: ${props => props.selected ? 'white' : 'black'};
  transform: ${props => props.selected ? 'scale(1.02)' : 'none'};

  &:last-child {
    margin-bottom: 0;
  }

  p {
    font-size: 20px;
  }

  &.available {
    border-color: green;
  }

  &.unavailable {
    background-color: #f0f0f0;
    cursor: not-allowed;
  }

  &.available:hover {
    cursor: pointer;
    transform: scale(1.02);
  }
`;



const Button = styled.button`
  padding: 15px 25px; // 이 부분은 버튼의 크기를 조절하기 위해 변경할 수 있습니다.
  font-size: 1.3rem; // 이 부분은 버튼 안의 글씨 크기를 조절하기 위해 변경할 수 있습니다.
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  // 버튼에 flex-grow 속성을 추가하지 않습니다.
  // 대신 ButtonContainer 내에서 flex-grow를 조정합니다.
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between; // 버튼들 사이에 공간을 균등하게 배분합니다.
  gap: 10px;
  padding-top: 3vh; // 버튼과 예약 정보 사이의 간격
`;


const SaveButton = styled(Button)`
  flex-grow: 9; // 저장 버튼이 더 큰 공간을 차지하도록 설정합니다.
`;

const CancelButton = styled(Button)`
  flex-grow: 1; // 취소 버튼은 작은 공간을 차지하도록 설정합니다.
  background-color:#808080;
`;

const Formation = () => {

  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedItem, setSelectedItem] = useState<string>(''); // 선택된 아이템을 상태로 관리합니다.
  const [homeTeamLogo, setHomeTeamLogo] = useState<string>('');
  const [homeTeamId, setHomeTeamId] = useState<string>('');

  const location = useLocation();
  const { fieldId, fieldName, locationId, imageUrl, address,phone } = location.state || {};

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    // 구단주 체크를 수행하는 함수
    const checkIfIsCreator = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/match/creator", {
          headers: {
            Authorization: `Bearer ${accessToken}` // Bearer 토큰 추가
          }
        });
        const homeTeamLogo = response.data?.data[0]?.logoUrl;
        const homeTeamId = response.data?.data[0]?.id;
        setHomeTeamLogo(homeTeamLogo);
        setHomeTeamId(homeTeamId);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };

    checkIfIsCreator(); // 데이터를 불러오는 함수 호출
  }, []);



  /*********  달력  **********/

  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    handleDateChange(today);
  }, []);

  // 이전 날짜를 비활성화하기 위한 함수
  const isPastDate = (date:Date) => {
    // '오늘 날짜'의 시작부터 비교하려면 오늘 날짜를 0시 0분 0초로 설정해야 합니다.
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작으로 설정
    
    // date가 '오늘 날짜의 시작'과 같거나 이후이면 false를 반환 (활성화)
    return date < today;
  };  

  // 날짜를 선택했을 때 예약 정보를 조회하는 함수
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime(null);
    if (date) {
      // 예약 정보를 조회하는 API 호출 (예시)
      fetchReservations(date);
    }
  };


  /*********  예약정보(예약 시간대별 리스트)  **********/

  // 예약 정보의 타입을 정의
  type Reservation = {
    time: string;
    status: string;
  };

  // 선택된 날짜의 예약 정보를 관리하는 상태
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // 예약 시간을 선택하는 함수입니다.
  const handleTimeSelect = (reservation: Reservation) => {

      // 예약 가능한 상태가 아닌 경우 함수 종료
      if (reservation.status !== '예약 가능') {
        return;
      }

      if (selectedTime === reservation.time) {
          setSelectedTime(null); // 이미 선택된 시간을 다시 클릭하면 선택 취소
      } else {
          setSelectedTime(reservation.time); // 새로운 시간을 선택
      }
  };

  // 예약 정보를 조회하는 API 호출
  const fetchReservations = (date: Date) => {
    
      const findAvailableTimes = async () => {
          try {
            const formattedDate = date.toISOString().split('T')[0]; // 날짜를 'YYYY-MM-DD' 형식으로 포맷팅
            
            const response = await axios.get(`http://localhost:3001/api/match/timeslots/${formattedDate}/${locationId}`, {
              headers: {
                Authorization: `Bearer ${accessToken}` // Bearer 토큰 추가
              }
            });
            const fieldData: Reservation[] = response.data.data;
            let resultData = fieldData.map((item: Reservation) => ({
              time: item.time,
              status: item.status
            }));

            setReservations(resultData);
          } catch (error) {
            console.error("데이터 불러오기 실패:", error);
          }
        };
      
        findAvailableTimes(); // 데이터를 불러오는 함수 호출   
    
  };



  /*********  경기 요청 (버튼)  **********/
  const handleSaveButtonClick = () => {
    // 경기 일자 선택되지 않았을 경우 경고 메시지 표시
    if (!selectedDate) {
      alert('경기 일자를 입력해주세요');
      return;
    }

    // 경기 일자 선택되지 않았을 경우 경고 메시지 표시
    if (!selectedTime) {
      alert('경기 시간을 입력해주세요');
      return;
    }


    const sendMatchMessage = async () => {
      try {

        await axios.post("http://localhost:3001/api/match/book", {
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime ? selectedTime : '시간 미선택',
          homeTeamId,
          awayTeamId: 1,
          fieldId: locationId
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}` // Bearer 토큰 추가
          }
        });

        // API 호출 성공 시
        alert("상대팀 구단주에게 수락 요청 이메일을 보냈습니다.");
        navigate("/home"); // 여기서 "/home"은 홈 페이지의 경로입니다.

      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };
    //sendMatchMessage(); 
    // confirm 대화 상자를 사용하여 사용자 확인 요청
    if (window.confirm(` ${selectedDate.toISOString().split('T')[0]} ${selectedTime ? selectedTime : '시간 미선택'}자 경기 요청하시겠습니까?`)) {
      // 사용자가 '확인'을 누르면, 경기 요청 메시지를 보내는 함수 호출
      sendMatchMessage();
    }

  };

  return (
    <Layout>
    <TripleContainer>
      <div>
        <Sidebar>
            <ImageContainer>
            <Image src='../../img/field.png' alt="경기장 사진" />
                <DraggableCircle bounds="parent" />
                <DraggableCircle bounds="parent" />
                <DraggableCircle bounds="parent" />
            </ImageContainer>
        </Sidebar>
      </div>
      <div>
        <ReservationInfo>
            {selectedDate && (
                <>
                <ReservationTitle>
                    {selectedDate.toLocaleDateString('ko-KR')} 예약 정보
                </ReservationTitle>
                {reservations.length > 0 ? (
                reservations.map((reservation, index) => (
                    <TimeSlot key={index} 
                              className={reservation.status === '예약 가능' ? 'available' : 'unavailable'}
                              onClick={() => handleTimeSelect(reservation)}
                              selected={selectedTime === reservation.time}>
                    <p>
                        <b>{reservation.time}</b> - {reservation.status}
                    </p>
                    </TimeSlot>
                ))
                ) : (
                <p>예약 정보가 없습니다.</p>
                )}
                </>
            )}
        <ButtonContainer>
        <CancelButton onClick={() => navigate("/match")}>취소</CancelButton>
        <SaveButton onClick={handleSaveButtonClick}>경기 요청</SaveButton>
        </ButtonContainer>
        </ReservationInfo>

      </div>
    </TripleContainer>
    </Layout>
  );
};

export default Formation;