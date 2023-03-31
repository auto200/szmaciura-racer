import React from "react";
import styled from "styled-components";
import { FaGithub } from "react-icons/fa";

const GithubIconContainer = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
  position: fixed;
  top: 5px;
  left: 5px;
  font-size: 35px;
`;

const GithubLink: React.FC = () => {
  return (
    <GithubIconContainer
      href="https://github.com/auto200/szmaciura-racer"
      target="_blank"
      title="Github"
    >
      <FaGithub />
    </GithubIconContainer>
  );
};

export default GithubLink;
