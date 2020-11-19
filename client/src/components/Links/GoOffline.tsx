import React from "react";
import Img from "gatsby-image";
import { useStaticQuery, graphql, Link } from "gatsby";
import styled from "styled-components";

const Wrapper = styled(Link)`
  position: absolute;
  top: 35px;
  left: 35px;
  cursor: pointer;
  text-decoration: none;
  width: 350px;
`;
const GoOfflineText = styled.div`
  font-size: 1.4rem;
  text-align: center;
  background: linear-gradient(to right, #fff 20%, #ff0 40%, #ff0 60%, #fff 80%);
  background-size: 200% auto;

  color: #000;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  animation: shine 30s linear infinite;
  @keyframes shine {
    to {
      background-position: 200% center;
    }
  }
`;

interface Props {
  to: string;
  onClick: () => void;
}

const GoOffline: React.FC<Props> = ({ to, onClick }) => {
  const data = useStaticQuery(graphql`
    query {
      rafonixOffline: file(relativePath: { eq: "rafonix_offline.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 350) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `);
  return (
    <Wrapper to={to} onClick={onClick}>
      <Img fluid={data.rafonixOffline.childImageSharp.fluid} />
      <GoOfflineText>Powrót do zabawy solo</GoOfflineText>
    </Wrapper>
  );
};

export default GoOffline;
