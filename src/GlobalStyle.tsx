import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import "./font.css";

const GlobalStyle = createGlobalStyle`
 ${reset}



body {
    font-family : 'HakgyoansimJiugaeR';
}

`;

export default GlobalStyle;
