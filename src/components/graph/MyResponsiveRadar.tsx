import { ResponsiveRadar } from '@nivo/radar';
import './graph.css';

export interface MyResponsiveRadarType {
    data: Array<{
        stats: string;
        myTeam: number;
        avgTeam: number;
    }>;
}

const MyResponsiveRadar = ({ data }: any) => {
    return (
        <div className="radar-container">
            <ResponsiveRadar
                data={data.data}
                keys={['myTeam', 'avgTeam']}
                indexBy="stats"
                maxValue={100}
                // valueFormat=">-.2f"
                margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
                borderColor={{ from: 'color' }}
                gridLabelOffset={36}
                dotSize={10}
                dotColor={{ theme: 'background' }}
                dotBorderWidth={2}
                colors={{ scheme: 'nivo' }}
                blendMode="normal"
                motionConfig="wobbly"
                legends={[
                    {
                        anchor: 'top-left',
                        direction: 'column',
                        translateX: -50,
                        translateY: -40,
                        itemWidth: 50,
                        itemHeight: 20,
                        itemTextColor: '#999',
                        symbolSize: 12,
                        symbolShape: 'circle',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemTextColor: '#000',
                                },
                            },
                        ],
                    },
                ]}
            />
        </div>
    );
};

export default MyResponsiveRadar;
