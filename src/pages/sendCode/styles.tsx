import styled from "styled-components";

// Styled components
export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  text-align: center;
`;

export const FormContainer = styled.div`
  width: 30%;
  border: 2px solid #blue;
  padding: 2rem;
  border-radius: 10px;
  background-color: white;
`;

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const StyledInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const StyledButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background-color: #000;
  color: #fff;
  cursor: pointer;

  &:hover {
    background-color: #555;
  }
`;

export const Title = styled.h3`
  text-align: center;
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
`;

export const LinkContainer = styled.p`
  font-size: 13px;
  color: #616061;
  margin: 0 0 8px 0;
  width: 400px;
  max-width: 400px;
  text-align: left;
  & a {
    color: #1264a3;
    text-decoration: none;
    font-weight: 700;
    &:hover {
      text-decoration: underline;
    }
  }
`;
