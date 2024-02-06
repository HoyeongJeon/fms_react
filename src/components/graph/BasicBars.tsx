import { BarChart } from '@mui/x-charts/BarChart';
import { YellowAndRedCardsType } from 'pages/Team';

export default function BasicBars(props: YellowAndRedCardsType) {
    const colors = ['#FFC107', '#FF0000'];

    const date = props.yellowAndRedCards.map((item) => {
        return item.created;
    });

    const yellowCards = props.yellowAndRedCards.map((item) => {
        return item.yellow;
    });

    const redCards = props.yellowAndRedCards.map((item) => {
        return item.red;
    });

    return (
        <div className="bar-main-container">
            <BarChart
                xAxis={[
                    {
                        scaleType: 'band',
                        data: date,
                    },
                ]}
                series={[{ data: yellowCards }, { data: redCards }]}
                width={500}
                height={300}
                colors={colors}
            />
            <div className="bar-container">
                <div className="bar-yellow">옐로우 카드</div>
                <div>색깔</div>

                <div className="bar-red">레드 카드</div>
                <div>색깔</div>
            </div>
        </div>
    );
}
