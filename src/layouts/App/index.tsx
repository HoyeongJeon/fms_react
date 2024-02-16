import React, { useCallback, useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import fetcher from "utils/fetcher";
import { useTeamStore } from "store/teamStore";
import { useUserStore } from "store/userStore";
import { useProfileStore } from "store/profileStore";
import useAuthStore from "store/useAuthStore";
import {
  Card,
  Menu,
  MenuItem,
  PageContainer,
  ProfileSection,
  StyledLink,
} from "./styles";
import { Typography } from "antd";
import { useMemberStore } from "store/memberStore";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import styled from "styled-components";
import useSWRInfinite from "swr/infinite";
import useSocket from "utils/useSocket";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import makeSection from "utils/makeSection";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AiTwotoneMessage } from "react-icons/ai";
import { MyTime, OthersTime, StickyHeader } from "../../pages/Home/styles";
import ChatBox from "components/ChatBox";
import {
  ChatMessage,
  ChatWrapper,
  MyChatMessage,
} from "components/ChatList/styles";

dayjs.extend(utc);

export const Section = styled.section`
  margin-top: 20px;
  border-top: 1px solid #eee;
`;

const { Title } = Typography;
interface LayoutProps {
  children: React.ReactNode;
}

export interface Message {
  id: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
}

type ButtonProps = React.ComponentProps<typeof Button>;

const StyledButton = styled(Button)<{
  variant: ButtonProps["variant"];
}>`
  color: #445664;
  font-size: 14px;
  cursor: pointer;
  background-color: transparent;
  border: none;

  &:hover {
    span {
      font-weight: bold;
    }
  }
`;

/**
 * To Do
 * 1. 유저 정보 저장하기
 * 2. 프로필 페이지 만들기
 * 3. 프로필 페이지에서 서버로 데이터 전송
 */

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data, error } = useSWR(
    "/users/me",
    fetcher
    // { dedupingInterval: 1000 * 60 * 60 * 24 }
  );
  const { setMemberId, setMember, isStaff } = useMemberStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const { teamId, name: teamName, chatId, setTeamInfo } = useTeamStore();
  const { setProfile, id: profileId, resetProfile } = useProfileStore();
  const { id: userId, setUser } = useUserStore();
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data.length) return null;

    return `/chats/${chatId}/messages?order__createdAt=DESC&page=${
      pageIndex + 1
    }`;
  };

  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
    isValidating,
  } = useSWRInfinite(getKey, fetcher);
  const isEmpty = chatData?.[chatData?.length - 1].data?.length === 0;
  const isReachingEnd =
    isEmpty || (chatData && chatData[chatData.length - 1].length < 30);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [chat, setChat] = useState("");

  const [messages, setMessages] = useState<any[]>([]);
  const [socket] = useSocket(chatId);
  const [nextUrl, setNextUrl] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null); // 스크롤을 위한 ref 생성
  const [total, setTotal] = useState(0);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const scrollable = e.currentTarget;
      if (scrollable.scrollTop === 0 && !isReachingEnd && !isValidating) {
        setSize((size) => size + 1);

        const data = chatData?.reverse()[0];
        const formattedData = data.data.map((msg: any) => {
          return {
            ...msg,
            createdAt: dayjs(msg.createdAt).add(9, "hour").format("h:mm A"),
            updatedAt: dayjs.utc(msg.updatedAt).subtract(6, "hour").format(),
          };
        });
        // 중복되지 않는 메시지만 추가
        setMessages((currentMessages) => {
          const currentMessageIds = new Set(
            currentMessages.map((msg) => msg.id)
          );
          const newMessages = formattedData.filter(
            (msg: Message) => !currentMessageIds.has(msg.id)
          );
          return [...currentMessages, ...newMessages];
        });
      }
    },
    [setSize, isReachingEnd, isValidating, chatData]
  );

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const onChangeChat = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setChat(e.target.value);
    },
    [setChat]
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 채팅 입력시
  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let time = new Date();
    let messageData = {
      chatId: teamId,
      message: chat,
    };
    if (socket && typeof socket !== "boolean" && typeof socket !== "function") {
      socket.emit("send_message", messageData);

      const tempMsg = {
        ...messageData,
        author: {
          id: userId,
        },
        createdAt: dayjs(time).add(3, "minutes").format("h:mm A"),
        updatedAt: dayjs.utc(time).subtract(6, "hour").format(),
      };
      setMessages((messages) => [tempMsg, ...messages]);
    }
    setChat("");
  };

  // 처음 렌더링 될 때 실행되는 함수
  // 과거 메세지 불러와서 저장
  useEffect(() => {
    if (teamId) {
      axios
        .get(
          `${process.env.REACT_APP_SERVER_HOST}:${
            process.env.REACT_APP_SERVER_PORT || 3000
          }/api/chats/${teamId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-type": "application/json",
            },
            withCredentials: true,
          }
        )
        .then((res: any) => {
          setNextUrl(res.data?.next);
          const data: any[] = res.data.data;
          const formattedData = data.map((msg) => {
            return {
              ...msg,
              createdAt: dayjs(msg.createdAt).add(9, "hour").format("h:mm A"), // 여기 !!!!
            };
          });
          setMessages((currentMessages) => {
            const messageIds = new Set(currentMessages.map((msg) => msg.id));
            const newMessages = formattedData.filter(
              (msg) => !messageIds.has(msg.id)
            );
            return [...newMessages];
          });
        })
        .catch((err: any) => {
          console.error("err= ", err);
        });
    }
  }, [teamId]);

  // 메세지 받은 경우 화면 리렌더링
  useEffect(() => {
    socket?.on("receive_message", (data: any) => {
      const time = new Date();
      const formattedData = {
        ...data,
        createdAt: dayjs(data.createdAt).add(9, "hour").format("h:mm A"),
        updatedAt: dayjs.utc(time).subtract(6, "hour").format(),
      };
      setMessages((messages) => [formattedData, ...messages]);
    });
  }, [socket]);

  useEffect(() => {
    socket?.on("enter_team", (data: any) => {
      toast.info(`${data.message}`);
    });
  }, [socket]);

  // 모달이 열린 경우 스크롤 최하단으로 이동
  useEffect(() => {
    if (show) {
      scrollToBottom();
    }
  }, [show]);

  const chatSections = makeSection(messages ? [...messages].reverse() : []);

  useEffect(() => {
    if (data) {
      resetProfile();

      setUser(data.data);
      setTeamInfo(
        data.data?.member[0]?.team?.id || data.data?.team?.id,
        data.data?.member[0]?.team?.name || data.data?.team?.name,
        data.data?.member[0]?.team?.imageUUID || data.data?.team?.imageUUID,
        data.data?.member[0]?.team?.chat?.id || data.data?.team?.chat?.id
      );
      setMemberId(data.data?.member[0]?.id ? data.data?.member[0]?.id : null);
      setMember(data.data?.member[0] || { isStaff: false });
    }

    if (data?.data.profile) {
      setProfile(data.data.profile);
    }
  }, [data]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutModalClose = () => setShowLogoutModal(false);
  const handleLogoutModalShow = () => setShowLogoutModal(true);

  return (
    <PageContainer>
      <Menu>
        <MenuItem>
          <StyledLink to="/home">HOME</StyledLink>
        </MenuItem>
        <MenuItem>
          <StyledLink
            to={
              profileId
                ? `/profile/${profileId}`
                : userId
                ? `/profile/${userId}/register`
                : "/home"
            }
            onClick={() => {
              if (!profileId && !userId) {
                alert("죄송합니다! MY PROFILE을 다시 클릭해주세요");
                navigate("/home");
              }
            }}
          >
            MY PROFILE
          </StyledLink>
        </MenuItem>

        {teamId ? (
          <>
            <MenuItem>
              <StyledLink to="/team">TEAM</StyledLink>
            </MenuItem>
            <MenuItem>
              <StyledLink to="/match/calendar">SCHEDULE</StyledLink>
            </MenuItem>
            <MenuItem>
              <StyledLink to="/player">PLAYER</StyledLink>
            </MenuItem>
            {isStaff ? (
              <>
                <MenuItem>
                  <StyledLink to="/memberTable">INVITE</StyledLink>
                </MenuItem>
              </>
            ) : (
              <></>
            )}

            {/* <MenuItem>
              <StyledLink to="/teamTable">JOIN</StyledLink>
            </MenuItem> */}
          </>
        ) : (
          <></>
        )}
        <Button variant="white" onClick={handleLogoutModalShow}>
          <span
            style={{
              color: "#445664",
              fontSize: "14px",
            }}
          >
            LOGOUT
          </span>
        </Button>
        {/* <MenuItem
          onClick={handleLogout}
          style={{
            color: "#445664",
          }}
        >
          LOGOUT
        </MenuItem> */}
      </Menu>
      <Card>
        <>
          <Modal
            show={showLogoutModal}
            onHide={handleLogoutModalClose}
            animation={false}
          >
            <Modal.Header closeButton>
              <Modal.Title>로그아웃</Modal.Title>
            </Modal.Header>
            <Modal.Body>로그아웃 하시겠습니까?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleLogoutModalClose}>
                아니요
              </Button>
              <Button variant="primary" onClick={handleLogout}>
                네
              </Button>
            </Modal.Footer>
          </Modal>
        </>
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <StyledLink to="/home">
            <div>
              <span
                style={{
                  textAlign: "center",
                  // fontFamily: "HakgyoansimJiugaeR",
                  fontSize: "40px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  color: "black",
                }}
              >
                축구왕
              </span>
            </div>
          </StyledLink>
          <div
            style={{
              position: "absolute", // 절대적 위치 설정
              top: 50, // 상단에 맞춤
              right: 70, // 우측에 맞춤
              color: "red", // 빨간 박스가 있다면 이 부분은 필요 없음
              padding: "10px", // 패딩으로 빨간 박스 내부에 여유 공간 생성
            }}
          >
            {teamId ? (
              <>
                <Button
                  variant="outline-light"
                  onClick={() => setShow(true)}
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <AiTwotoneMessage color="black" size={30} />
                </Button>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>

        {teamId && (
          <>
            <div>
              <ToastContainer limit={1} autoClose={4000} hideProgressBar />
            </div>
            <Modal show={show} fullscreen={true} onHide={() => setShow(false)}>
              <Modal.Header closeButton>
                <Modal.Title>{teamName}의 채팅방</Modal.Title>
              </Modal.Header>
              <Modal.Body
                style={{
                  overflow: "scroll",
                }}
                onScroll={onScroll}
              >
                {Object.entries(chatSections).map(([date, chats]) => {
                  return (
                    <Section className={`section-${date}`} key={date}>
                      <StickyHeader>
                        <button>{date}</button>
                      </StickyHeader>
                      {chats.map((chat) => (
                        <>
                          {userId === chat?.author?.id ? (
                            <ChatWrapper>
                              <MyChatMessage>
                                {chat.message}
                                <MyTime>{chat.createdAt}</MyTime>
                              </MyChatMessage>
                            </ChatWrapper>
                          ) : (
                            <ChatWrapper>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                }}
                              >
                                <ChatMessage>
                                  <span style={{ fontWeight: "bold" }}>
                                    {chat?.author?.name}
                                  </span>
                                  : {chat.message}
                                  <OthersTime>{chat.createdAt}</OthersTime>
                                </ChatMessage>
                              </div>
                            </ChatWrapper>
                          )}
                        </>
                      ))}
                    </Section>
                  );
                })}

                <div ref={messagesEndRef} />
              </Modal.Body>
              <ChatBox
                chat={chat}
                teamId={teamId}
                onChangeChat={onChangeChat}
                onSubmitForm={onSubmitForm}
              />
              <Modal.Footer>
                <Button variant="outline-dark" onClick={handleClose}>
                  닫기
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
        {children}
      </Card>
    </PageContainer>
  );
};

export default Layout;
