import React from "react";
import "../Layout/layout.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";

export default function Calendar() {
  const apiKey = process.env.REACT_APP_CAL_API_KEY;

  return (
    <div className="page-container">
      <div className="menu">
        {/* 메뉴 내용 */}
        <p>메뉴 항목 1</p>
        <p>메뉴 항목 2</p>
      </div>
      <div className="card">
        <FullCalendar
          plugins={[dayGridPlugin, googleCalendarPlugin]}
          initialView="dayGridMonth"
          googleCalendarApiKey={apiKey}
          events={{
            googleCalendarId: "readingrocket9@gmail.com",
          }}
          eventDisplay={"block"}
          eventTextColor={"#FFF"}
          eventColor={"#F2921D"}
          height={"660px"}
        />
      </div>
      <div className="profile-logo">
        {/* 프로필 로고 내용 */}
        <img src="프로필이미지주소" alt="프로필" />
      </div>
      {/* 나머지 레이아웃 내용 */}
    </div>
  );
}
