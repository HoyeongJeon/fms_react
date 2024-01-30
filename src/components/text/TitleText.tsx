import './team-title.css';

interface TitleTextType {
    title: string;
}

const TitleText = (props: TitleTextType) => {
    return <h5 className="team-title">{props.title}</h5>;
};

export default TitleText;
