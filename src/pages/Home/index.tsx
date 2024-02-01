import Layout from "layouts/App";
import { useTeamStore } from "store/teamStore";
import CustomButton from "components/CustomButton";
import { ErrorContainer, ErrorMessage, MyTime, OthersTime } from "./styles";
import { AiTwotoneMessage } from "react-icons/ai";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatBox from "components/ChatBox";
import useSocket from "utils/useSocket";
import useSWRInfinite from "swr/infinite";
import fetcher from "utils/fetcher";
import { useUserStore } from "store/userStore";
import {
  ChatMessage,
  ChatWrapper,
  MyChatMessage,
} from "components/ChatList/styles";
import axios from "axios";
import dayjs from "dayjs";
import styled from "styled-components";

export const Section = styled.section`
  margin-top: 20px;
  border-top: 1px solid #eee;
`;

interface Message {
  id: number;
  message: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
}

const Home = () => {
  const { teamId, name: teamName, chatId } = useTeamStore();
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
  const isEmpty = chatData?.[0]?.data?.length === 0;
  const isReachingEnd =
    isEmpty || (chatData && chatData[chatData.length - 1]?.data?.length < 20);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [chat, setChat] = useState("");

  const [messages, setMessages] = useState<any[]>([]);
  const [socket] = useSocket(chatId);
  const [nextUrl, setNextUrl] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null); // 스크롤을 위한 ref 생성

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const scrollable = e.currentTarget;
      if (scrollable.scrollTop === 0 && !isReachingEnd && !isValidating) {
        setSize((size) => size + 1); // This will load the next page
        console.log(
          "chatData?.flat().reverse()= ",
          chatData?.flat().reverse()[0] // 데이터
        );
        const data = chatData?.flat().reverse()[0];
        console.log("data=", data);
        const formattedData = data.data.map((msg: any) => {
          return {
            ...msg,
            createdAt: dayjs(msg.createdAt).add(9, "hour").format("h:mm A"),
          };
        });
        setMessages((messages) => [...messages, ...formattedData]);
      }
    },
    [setSize, isReachingEnd, isValidating]
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
    console.log("socket= ", socket);
    if (socket && typeof socket !== "boolean" && typeof socket !== "function") {
      socket.emit("send_message", messageData);
      const tempMsg = {
        ...messageData,
        author: {
          id: userId,
        },
        createdAt: dayjs(time).add(3, "minutes").format("h:mm A"),
      };
      console.log(tempMsg);
      setMessages((messages) => [tempMsg, ...messages]);
    }
    setChat("");
  };

  // 처음 렌더링 될 때 실행되는 함수
  // 과거 메세지 불러와서 저장
  useEffect(() => {
    if (teamId) {
      axios
        .get(`http://localhost:3000/api/chats/${teamId}/messages`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-type": "application/json",
          },
          withCredentials: true,
        })
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
            return [...currentMessages, ...newMessages];
          });
        })
        .catch((err: any) => {
          console.log("err= ", err);
        });
    }
  }, [teamId, setMessages]);

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

  return (
    <>
      <Layout>
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
        {teamId ? (
          <>
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
                {messages &&
                  [...messages].reverse().map((message) => (
                    <>
                      {userId === message?.author?.id ? (
                        <ChatWrapper>
                          <MyChatMessage>
                            {message.message}
                            <MyTime>{message.createdAt}</MyTime>
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
                                {message?.author?.name}
                              </span>
                              : {message.message}
                              <OthersTime>{message.createdAt}</OthersTime>
                            </ChatMessage>
                          </div>
                        </ChatWrapper>
                      )}
                    </>
                  ))}

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
          </>
        ) : (
          <ErrorContainer>
            <ErrorMessage>
              속한 팀이 없습니다.
              <br />
              팀을 생성하거나 팀에 참가하세요.
            </ErrorMessage>
            <CustomButton to="/team/create">팀 생성</CustomButton>
            <CustomButton to="/team/join">팀 참가하기</CustomButton>
          </ErrorContainer>
        )}
      </Layout>
    </>
  );
};

export default Home;
