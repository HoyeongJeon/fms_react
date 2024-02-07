import axios from "axios";
import ChatBox from "components/ChatBox";
import {
  ChatMessage,
  ChatWrapper,
  MyChatMessage,
} from "components/ChatList/styles";
import CustomButton from "components/CustomButton";
import dayjs from "dayjs";
import Layout from "layouts/App";
import { TeamStatsType } from "pages/Team";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { AiTwotoneMessage } from "react-icons/ai";
import { useProfileStore } from "store/profileStore";
import { useTeamStore } from "store/teamStore";
import { useUserStore } from "store/userStore";
import styled from "styled-components";
import useSWRInfinite from "swr/infinite";
import fetcher from "utils/fetcher";
import useSocket from "utils/useSocket";
import {
  ErrorContainer,
  ErrorMessage,
  MyTime,
  OthersTime,
  StickyHeader,
} from "./styles";
import BasicPie from "components/graph/BasicPie";
import makeSection from "utils/makeSection";
import utc from "dayjs/plugin/utc"; // import UTC plugin
dayjs.extend(utc);

export const Section = styled.section`
  margin-top: 20px;
  border-top: 1px solid #eee;
`;

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

const Home = () => {
  const { teamId, name: teamName, chatId } = useTeamStore();
  const [teamWinningRate, setTeamWinningRate] = useState<TeamStatsType>();
  const [rate, setRate] = useState<number>(0);
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
            updatedAt: dayjs.utc(msg.updatedAt).add(6, "hour").format(),
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
          console.log("err= ", err);
        });
    }
  }, [teamId]);

  // 메세지 받은 경우 화면 리렌더링
  useEffect(() => {
    socket?.on("receive_message", (data: any) => {
      const formattedData = {
        ...data,
        createdAt: dayjs(data.createdAt).add(9, "hour").format("h:mm A"),
      };
      setMessages((messages) => [formattedData, ...messages]);
    });
  }, [socket]);

  // 모달이 열린 경우 스크롤 최하단으로 이동
  useEffect(() => {
    if (show) {
      scrollToBottom();
    }
  }, [show]);

  useEffect(() => {
    const getWinningRate = async () => {
      const resultRate = await axios.get<TeamStatsType>(
        `${process.env.REACT_APP_SERVER_HOST}:${
          process.env.REACT_APP_SERVER_PORT || 3000
        }/api/statistics/${teamId}`,
        {
          params: {
            teamId,
          },
        }
      );

      setTeamWinningRate(resultRate.data);
    };

    getWinningRate();
  }, [teamId]);

  useEffect(() => {
    if (teamWinningRate?.wins && teamWinningRate?.totalGames) {
      setRate(
        Math.floor((teamWinningRate?.wins / teamWinningRate?.totalGames) * 100)
      );
    }
  }, [teamWinningRate]);

  const chatSections = makeSection(messages ? [...messages].reverse() : []);

  return (
    <>
      <Layout>
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
              <AiTwotoneMessage />
            </Button>
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
                      {chats.reverse().map((chat) => (
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
            <div>Your content here</div>
            <div>
              <div>
                <h3>팀 승률</h3>
                <h5>
                  {teamWinningRate?.wins ?? 0}승 {teamWinningRate?.draws ?? 0}무{" "}
                  {teamWinningRate?.loses ?? 0}패 {rate}%
                </h5>
                <BasicPie data={teamWinningRate} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* profileId가 없는 경우,  */}
            <ErrorContainer>
              <ErrorMessage>
                속한 팀이 없습니다.
                <br />
                팀을 생성하거나 팀에 참가하세요.
              </ErrorMessage>

              {profileId ? (
                <>
                  <CustomButton to="/team/create">팀 생성</CustomButton>
                  <CustomButton to="/teamTable">팀 참가하기</CustomButton>
                </>
              ) : (
                <>
                  <CustomButton
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("프로필을 생성해주세요.");
                    }}
                  >
                    팀 생성
                  </CustomButton>
                  <CustomButton
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("프로필을 생성해주세요.");
                    }}
                  >
                    팀 참가하기
                  </CustomButton>
                </>
              )}
            </ErrorContainer>
          </>
        )}
      </Layout>
    </>
  );
};

export default Home;
