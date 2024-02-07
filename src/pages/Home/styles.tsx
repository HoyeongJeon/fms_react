import styled from "styled-components";

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

export const ErrorMessage = styled.p`
  color: #000;
  text-align: center;
`;

export const MyTime = styled.span`
  display: block;
  text-align: right;
  font-size: 0.75rem; /* Example size, adjust as needed */
  color: #ffffff; /* Adjust color as needed */
  opacity: 0.8; /* Example opacity, adjust as needed */
  margin-top: 5px;
`;

export const OthersTime = styled.span`
  display: block;
  text-align: left;
  font-size: 0.75rem; /* Example size, adjust as needed */
  color: #000000; /* Adjust color as needed */
  opacity: 0.8; /* Example opacity, adjust as needed */
  margin-top: 5px;
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
