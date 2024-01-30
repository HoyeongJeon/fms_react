import { TeamStatsType } from 'pages/Team';
import './dl-text.css';

interface DlTextType {
    title: string;
    content?: number | string;
    className?: string;
    data?: TeamStatsType;
}

const DlText = (props: DlTextType) => {
    let winRate = 0;
    if (props.data) {
        winRate = Math.floor((props.data?.wins / props.data?.totalGames) * 100);
    }

    return (
        <dl className={props.className}>
            <dt>{props.title}</dt>
            {props.data ? <dd>{winRate}%</dd> : <dd>{props.content}</dd>}
        </dl>
    );
};

export default DlText;
