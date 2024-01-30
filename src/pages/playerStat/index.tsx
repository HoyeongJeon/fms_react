import React from "react";
import { ResponsiveBar as NivoResponsiveBar, BarDatum } from "@nivo/bar";
import Layout from "layouts/App";

const MyResponsiveBar: React.FC<{ data: BarDatum[] }> = ({ data }) => (
  <NivoResponsiveBar
    data={data}
    keys={["hotdog", "burger"]}
    indexBy="country"
    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
    padding={0.3}
    colors={{ scheme: "category10" }} // You can change the color scheme as needed
  />
);

const dataForTotalGamesPlayed: BarDatum[] = [
  { country: "Mon", hotdog: 2, burger: 3 },
  { country: "Tue", hotdog: 3, burger: 2 },
  // Add other data points based on your actual data structure
];

const PlayerStatistics = () => {
  return (
    <Layout>
    <div>
      <div className="card">
        <div className="card-header">총 게임수 </div>
        <div className="card-body">22</div>
      </div>

      <div className="card">
        <div className="card-header">총 골 갯수 </div>
        <div className="card-body">14</div>
      </div>

      <div className="card">
        <div className="card-header">총 포지션 </div>
        <div className="card-body">14</div>
      </div>

      <div className="card">
        <div className="card-header">총 레드카드 </div>
        <div className="card-body">14</div>
      </div>

      <div className="card">
        <div className="card-header">총 옐로카드 </div>
        <div className="card-body">14</div>
      </div>

      <div className="card">
        <div className="card-header">그래프 예시</div>
        <div style={{ height: "400px" }}>
          <MyResponsiveBar data={dataForTotalGamesPlayed} />
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default PlayerStatistics;
