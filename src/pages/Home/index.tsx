import Layout from "layouts/App";
import { useTeamStore } from "store/teamStore";
import CustomButton from "components/CustomButton";
import { ErrorContainer, ErrorMessage } from "./styles";
import { AiTwotoneMessage } from "react-icons/ai";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatBox from "components/ChatBox";
import useSocket from "utils/useSocket";
import useSWR, { mutate } from "swr";
import useSWRInfinite from "swr/infinite";
import fetcher from "utils/fetcher";
import { useUserStore } from "store/userStore";
import {
  ChatMessage,
  ChatWrapper,
  MyChatMessage,
} from "components/ChatList/styles";
import axios from "axios";
import styled from "styled-components";

// const StyledBooststrapButton = styled(Button)``;

const Home = () => {
  const { teamId, name: teamName, chatId } = useTeamStore();
  const { id: userId, setUser } = useUserStore();
  const { data: chatDatas } = useSWRInfinite(
    () => `/chats/${teamId}/messages`,
    fetcher
  );
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [chat, setChat] = useState("");

  const [messages, setMessages] = useState<any[]>([]);
  const [socket] = useSocket(chatId);

  const messagesEndRef = useRef<HTMLDivElement>(null); // 스크롤을 위한 ref 생성

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  useEffect(() => {
    scrollToBottom(); // 메시지 배열이 업데이트 될 때 스크롤을 하단으로 이동
  }, [messages]);

  const onChangeChat = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setChat(e.target.value);
    },
    [setChat]
  );

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let messageData = {
      chatId: teamId,
      message: chat,
    };
    if (socket && typeof socket !== "boolean" && typeof socket !== "function") {
      socket.emit("send_message", messageData);
      console.log("messageData: ", messageData);
      const tempMsg = {
        ...messageData,
        author: {
          id: userId,
        },
      };
      setMessages((messages) => [tempMsg, ...messages]);
    }
    setChat("");
  };

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
          const data: any[] = res.data.data;
          setMessages((currentMessages) => {
            const messageIds = new Set(currentMessages.map((msg) => msg.id));
            const newMessages = data.filter((msg) => !messageIds.has(msg.id));
            return [...currentMessages, ...newMessages];
          });
        })
        .catch((err: any) => {
          console.log("err= ", err);
        });
    }
  }, [teamId, setMessages]);

  useEffect(() => {
    socket?.on("receive_message", (data: any) => {
      setMessages((messages) => [data, ...messages]);
    });
  }, [socket]);

  useEffect(() => {
    if (show) {
      // 모달이 열렸을 때 스크롤을 최하단으로 이동시킵니다.
      scrollToBottom();
    }
  }, [show]);

  return (
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
            >
              {messages &&
                [...messages].reverse().map((message) => (
                  <>
                    {userId === message?.author?.id ? (
                      <>
                        <ChatWrapper>
                          <MyChatMessage>{message.message} </MyChatMessage>
                        </ChatWrapper>
                      </>
                    ) : (
                      <>
                        <ChatWrapper>
                          <ChatMessage>
                            <span
                              style={{
                                fontWeight: "bold",
                              }}
                            >
                              {message?.author?.name}
                            </span>
                            : {message.message}
                          </ChatMessage>
                        </ChatWrapper>
                      </>
                    )}
                  </>
                ))}
              <ChatBox
                chat={chat}
                teamId={teamId}
                onChangeChat={onChangeChat}
                onSubmitForm={onSubmitForm}
              />
              <div ref={messagesEndRef} />
            </Modal.Body>
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
  );
};

export default Home;
