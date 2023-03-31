import NextImage from "next/image";
import Link from "next/link";
import React from "react";
import styled from "styled-components";

const Wrapper = styled.a`
  position: absolute;
  top: 35px;
  right: 35px;
  cursor: pointer;
  text-decoration: none;
  width: 350px;
`;
const GoOnlineText = styled.div`
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

const GoOnline: React.FC<Props> = ({ to, onClick }) => {
  return (
    <Link href={to} legacyBehavior>
      <Wrapper onClick={onClick}>
        <NextImage
          src={"/rafonix_online.jpg"}
          width={350}
          height={230}
          alt="go online"
        />
        <GoOnlineText>Wypróbuj tryb online!</GoOnlineText>
      </Wrapper>
    </Link>
  );
};

export default GoOnline;
