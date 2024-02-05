import { useEffect, useState } from 'react';
import './image-view.css';
import { getImageUrl } from 'pages/Team';

const ImageView = (props: any) => {
    const [teamLogo, setTeamLogo] = useState<string>('');

    useEffect(() => {
        if (props.imageUUID) {
            const getLogo = async () => {
                const logoUrl = await getImageUrl(props.imageUUID);

                setTeamLogo(logoUrl);
            };

            getLogo();
        }
    }, props.imageUUID);

    return <img src={teamLogo ?? ''} alt="" className="team-iamge" />;
};

export default ImageView;
