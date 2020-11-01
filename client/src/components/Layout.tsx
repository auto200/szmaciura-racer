import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import SEO from "../components/Seo";
import GithubLink from "./GithubLink";

const GlobalStyle = createGlobalStyle<any>`
  html, body {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.secondary};
    display: flex;
    justify-content: center;
    min-height: 100vh;
    font-size: 1.3rem;
  }

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  #gatsby-focus-wrapper{
    padding-top: 200px;
    border: 2px solid white;
    height: 100%;
  }
`;
const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 1024px;
  height: 100%;
  padding: 5px 20px;
`;

const Layout: React.FC = ({ children }) => {
  return (
    <>
      <GlobalStyle />
      <SEO title="Szmaciura Racer - Rafonix szmaciura" />
      <GithubLink />
      <InnerWrapper>{children}</InnerWrapper>
    </>
  );
};

export default Layout;
