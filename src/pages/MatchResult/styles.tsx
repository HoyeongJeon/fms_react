import styled from 'styled-components';

// Styled components
export const ScoreboardContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-height: 90vh; /* Maximum height of the scoreboard container */
    overflow-y: auto; /* Enable vertical scrolling */
    :: -webkit-scrollbar {
        /* Hide scrollbar for Chrome, Safari and Opera */
        display: none;
    }
`;

export const Title = styled.h1`
    font-size: 24px;
`;

export const TeamsContainer = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin: 20px;
`;

export const TeamBadge = styled.div`
    flex-direction: column;
    align-items: center;
`;

export const TeamLogo = styled.img`
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
`;

export const ScoreInput = styled.input`
    font-size: 2rem;
    width: 50px;
    margin: 0 20px;
    text-align: center;
`;

export const NextButton = styled.button`
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 1rem;
    background-color: blue;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: darkblue;
    }
`;

export const Score = styled.span`
    font-size: 2rem;
`;
