import NextImage from "next/image";
import Link from "next/link";
import React from "react";
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
  return (
    <Wrapper href={to} onClick={onClick}>
      <NextImage src="/rafonix_offline.jpg" alt="go offline" width={350} height={230} />
      <div>Powrót do zabawy solo</div>
    </Wrapper>
  );
};

export default GoOffline;
