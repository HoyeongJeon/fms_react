import styled from "styled-components";

export const ChatZone = styled.div`
  width: 100%;
  display: flex;
  height: calc(100vh - 300px);
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
`;

export const ChatWrapper = styled.div`
  padding: 1px 0px;
  display: flex;
  flex-direction: column;
`;

export const ChatMessage = styled.div`
  align-self: flex-start;
  text-align: left;
  max-width: 70%;
  margin-bottom: 17px;
  padding: 10px;
  line-height: 18px;
  letter-spacing: -0.28px;
  font-weight: 300;
  color: #000000;
  border: 1px solid #c4c4c4;
  background-color: #ffffff;
  border-radius: 0 10px 10px 10px;
`;

export const MyChatMessage = styled.div`
  align-self: flex-end;
  text-align: right;
  max-width: 70%;
  margin-bottom: 17px;
  padding: 10px;
  line-height: 18px;
  letter-spacing: -0.28px;
  font-weight: 300;
  color: #ffffff;
  border: 1px solid #40a6de;
  background-color: #40a6de;
  border-radius: 10px 0 10px 10px;
`;

export const Section = styled.section`
  margin-top: 20px;
  border-top: 1px solid #eee;
`;

export const StickyHeader = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
  width: 100%;
  position: sticky;
  top: 14px;
  & button {
    font-weight: bold;
    font-size: 13px;
    height: 28px;
    line-height: 27px;
    padding: 0 16px;
    z-index: 2;
    --saf-0: rgba(var(--sk_foreground_low, 29, 28, 29), 0.13);
    box-shadow: 0 0 0 1px var(--saf-0), 0 1px 3px 0 rgba(0, 0, 0, 0.08);
    border-radius: 24px;
    position: relative;
    top: -13px;
    background: white;
    border: none;
    outline: none;
  }
`;
