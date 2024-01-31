import styled from "styled-components";

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; // 각 열의 너비를 고정시킵니다.

  th,
  td {
    border: 1px solid #ddd;
    text-align: center; // 텍스트를 가운데 정렬합니다.
    padding: 8px;
    color: black;
  }

  th {
    background-color: #f2f2f2;
  }

  // 각 헤더와 셀에 대해 동일한 너비를 설정합니다.
  th,
  td {
    width: calc(90% / 7); // 7개의 열이 있으므로 100%를 7로 나눕니다.
  }
`;

export const StyledButton = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

export const ScoreboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
  max-width: 100%;
  overflow-x: auto;
`;

export const CustomButton = styled.button`
  background-color: transparent;
  color: black;
  border: none;
  width: 100%; // 부모 요소인 td의 너비를 채우도록 설정합니다.
  padding: 8px; // 여백을 조절합니다.
  margin: 0; // 마진을 제거합니다.
  box-sizing: border-box; // 패딩과 테두리가 너비에 포함되도록 설정합니다.
  cursor: pointer;

  &:hover {
    color: red; // 호버 시 색상 변경
  }
`;
