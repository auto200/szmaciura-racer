import React, { forwardRef, memo } from "react";
import styled from "styled-components";
import achievements from "./achievements_data";
import Tippy from "@tippyjs/react";
import { History } from "../../contexts/Store";
import "tippy.js/dist/tippy.css";
import middleFingerCursor from "../../assets/middleFingerCursor.png";

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
    filter: ${({ notObtained }) => notObtained && "brightness(0.2)"};
    cursor: url(${middleFingerCursor}), auto;
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
interface Props {
  history: History[];
}
const Achievements: React.FC<Props> = ({ history }) => {
  return (
    <>
      <h1>Osiągnięcia</h1>
      <Wrapper>
        {Object.values(achievements).map(achiv => {
          const { current, timestamp } = achiv.check(history);
          const { name, description, image, requiredToComplete } = achiv;
          return (
            <Tooltip
              key={name}
              content={
                <TooltipContent
                  name={name}
                  description={description}
                  timestamp={timestamp}
                />
              }
            >
              <div>
                <Image
                  src={image}
                  notObtained={timestamp ? false : true}
                  title={`${current}/${requiredToComplete}`}
                />
              </div>
            </Tooltip>
          );
        })}
      </Wrapper>
    </>
  );
};

export default memo(Achievements);
