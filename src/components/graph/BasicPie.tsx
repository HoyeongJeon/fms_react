import { PieChart } from '@mui/x-charts/PieChart';

export default function BasicPie(props: any) {
    if (props.data && props.data.tatalGames) {
        return (
            <PieChart
                series={[
                    {
                        data: [
                            { id: 0, value: props.data.wins, label: '승' },
                            { id: 1, value: props.data.draws, label: '무' },
                            { id: 2, value: props.data.loses, label: '패' },
                        ],
                    },
                ]}
                width={400}
                height={200}
            />
        );
    } else {
        return <p>게임 결과가 존재하지 않습니다. 1게임 이상 진행해주세요.</p>;
    }
}
