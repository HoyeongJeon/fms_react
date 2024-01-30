import { useCallback, useEffect, useRef } from "react";
import {
  ChatArea,
  Form,
  SendButton,
  StyledTextAreaWrapper,
  Toolbox,
} from "./styles";
import { AiOutlineSend } from "react-icons/ai";

interface Props {
  chat: string;
  teamId: number;
  onSubmitForm: (e: React.FormEvent<HTMLFormElement>) => void;
  onChangeChat: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ChatBox = ({ chat, teamId, onSubmitForm, onChangeChat }: Props) => {
  const textareaRef = useRef(null);

  const submitForm = () => {
    onSubmitForm({
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>);
  };
  const onKeyDownChat = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        if (e.nativeEvent.isComposing === false && !e.shiftKey) {
          e.preventDefault();
          submitForm();
        }
      }
    },
    [onSubmitForm, submitForm]
  );

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <StyledTextAreaWrapper>
          <textarea
            value={chat}
            onChange={onChangeChat}
            onKeyDown={onKeyDownChat}
            placeholder="메시지를 입력하세요."
            ref={textareaRef}
          />
        </StyledTextAreaWrapper>
        <Toolbox>
          <SendButton
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <AiOutlineSend />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
};

export default ChatBox;
