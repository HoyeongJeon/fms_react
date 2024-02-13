import styled from "styled-components";
import { Space, Typography } from "antd";

const { Text, Link } = Typography;

// Styled components for the bar chart
const StatsContainer = styled.div`
  width: 100%;
  margin-top: 20px;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StatValue = styled.span`
  width: 50px;
  text-align: center;
`;

const HigherHomeStatValue = styled(StatValue)`
  color: #ff4560;
`;

const HigherAwayStatValue = styled(StatValue)`
  color: #0000ff;
`;

interface BarProps {
  color: string;
  width: number; // 여기서는 width를 백분율로 설정하기 때문에 number 타입을 사용합니다.
}

interface StatData {
  label: string;
  home: number;
  away: number;
}

const ComparisonBarChart = ({ data }: { data: StatData[] }) => {
  return (
    <StatsContainer>
      {data.map((item, index) => (
        <>
          <Text strong>{item.label}</Text>
          <StatRow key={index}>
            {item.home === item.away ? (
              <>
                <StatValue>{item.home}</StatValue>
                <StatValue>{item.away}</StatValue>
              </>
            ) : item.home > item.away ? (
              <>
                <HigherHomeStatValue>{item.home}</HigherHomeStatValue>
                <StatValue>{item.away}</StatValue>
              </>
            ) : (
              <>
                <StatValue>{item.home}</StatValue>
                <HigherAwayStatValue>{item.away}</HigherAwayStatValue>
              </>
            )}
          </StatRow>
        </>
      ))}
    </StatsContainer>
  );
};

export default ComparisonBarChart;
