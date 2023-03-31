import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import SEO from "../components/Seo";
import GithubLink from "./Links/GithubLink";

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
   height:100%;
  }
`;
const Wrapper = styled.div`
  width: 1024px;
  height: 100%;
  padding: 5px 20px;
  border: 2px solid white;
  height: 100%;
`;
const ContentContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const Header = styled.header`
  height: 150px;
  text-align: center;
  font-size: 2rem;
`;
type LayoutProps = { children: React.ReactNode };
const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <GlobalStyle />
      <SEO />
      <GithubLink />
      <Wrapper>
        <Header>Szmaciura Racer</Header>
        <ContentContainer>{children}</ContentContainer>
      </Wrapper>
    </>
  );
};

export default Layout;
