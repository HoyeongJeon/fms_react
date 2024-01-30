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
