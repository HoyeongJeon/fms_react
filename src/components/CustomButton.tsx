import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Button = styled.button`
  padding: 10px 20px;
  min-width: 150px; // 버튼의 최소 너비 설정
  border: none;
  border-radius: 20px;
  background-color: #000;
  color: #fff;
  cursor: pointer;
  font-size: 1rem; // 폰트 크기 조정
  margin: 0 5px; // 버튼 사이의 간격 조정

  &:hover {
    background-color: #555;
  }

  &:active {
    transform: scale(0.98);
  }
`;

// After
type CustomButtonProps = {
  children: React.ReactNode;
  to: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; // 이 부분을 변경
};

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  to,
  ...props
}) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <Button onClick={handleNavigation} {...props}>
      {children}
    </Button>
  );
};

export default CustomButton;
