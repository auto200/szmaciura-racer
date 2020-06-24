import React, { forwardRef } from "react";
import styled from "styled-components";
import { useStore } from "../../contexts/Store";
import { achievementsImgMap } from "../../achievements";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const Tooltip = styled(Tippy)`
  background-color: rgba(0, 0, 0, 0.9);
  border: 2px solid ${({ theme }) => theme.colors.golden};
  .tippy-arrow {
    color: ${({ theme }) => theme.colors.golden};
  }
`;

const Image = styled.img<{ notObtained: boolean }>`
  width: 100px;
  filter: brightness(${({ notObtained }) => notObtained && "0.02"});
  transition: filter 0.3s ease;
  :hover {
    filter: brightness(0.2);
  }
`;
interface TooltipContentProps {
  name: string;
  description: string;
  timestamp?: number;
}
const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ name, description, timestamp }, ref) => {
    return (
      <div ref={ref}>
        <h3>{name}</h3>
        <div>{description}</div>
        {timestamp && <div>{new Date(timestamp).toLocaleString("pl")}</div>}
      </div>
    );
  }
);

const Achievements = () => {
  const {
    state: { achievements },
  } = useStore();
  return (
    <>
      <h1>Osiągnięcia</h1>
      <Wrapper>
        {Object.values(achievements).map(achiv =>
          achiv ? (
            <Tooltip
              content={
                <TooltipContent
                  name={achiv.name}
                  description={achiv.description}
                  timestamp={achiv.status.doneTimestamps[achiv.status.level]}
                />
              }
              key={achiv.name}
            >
              <div>
                <Image
                  src={achievementsImgMap[achiv.name][achiv.status.level]}
                  notObtained={!achiv.status.level}
                  title={`${achiv.status.current}/${
                    achiv.steps[achiv.status.level] ||
                    achiv.steps[achiv.status.level - 1]
                  }`}
                />
              </div>
            </Tooltip>
          ) : null
        )}
      </Wrapper>
    </>
  );
};

export default Achievements;
