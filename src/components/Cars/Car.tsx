import React from "react";
import styled from "styled-components";
import Img from "gatsby-image";
import Tippy from "@tippyjs/react";

interface ImageProps {
  available: boolean;
  active: boolean;
}
const Image = styled(Img)<ImageProps>`
  filter: brightness(
    ${({ available, active }) =>
      available && active ? 1 : available ? 0.5 : 0.1}
  );
  transition: filter 0.3s ease;
  :hover {
    filter: brightness(
      ${({ available, active }) => available && !active && "0.8"}
    );
    cursor: ${({ available }) => (available ? "pointer" : "not-allowed")};
  }
`;
const Tooltip = styled(Tippy)`
  background-color: rgba(0, 0, 0, 0.9);
  border: 2px solid ${({ theme }) => theme.colors.golden};
  .tippy-arrow {
    color: ${({ theme }) => theme.colors.golden};
  }
`;

interface Props {
  active: boolean;
  available: boolean;
  image: any;
  onClick: () => void;
  description: string;
}

const Car: React.FC<Props> = ({
  active,
  available,
  image,
  onClick,
  description,
}) => {
  return (
    <Tooltip content={<h2>{description}</h2>}>
      <div
        onClick={onClick}
        style={{
          width: 250,
          transform: !active ? "scale(0.9)" : "",
          transition: "transform 0.3s ease",
        }}
      >
        <Image fluid={image} available={available} active={active} />
      </div>
    </Tooltip>
  );
};

export default Car;
