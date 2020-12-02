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
  color: ${({ theme }) => theme.colors.secondary};
  text-align: center;
`;

interface Props {
  to: string;
  onClick: () => void;
}

const GoOffline: React.FC<Props> = ({ to, onClick }) => {
  const { rafonixOffline } = useStaticQuery(graphql`
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
      <Img fluid={rafonixOffline.childImageSharp.fluid} />
      <div>Powrót do zabawy solo</div>
    </Wrapper>
  );
};

export default GoOffline;
