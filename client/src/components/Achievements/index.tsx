import React, { memo } from "react";
import styled from "styled-components";
import achievements from "./achievements";
import Tippy from "@tippyjs/react";
import { HistoryEntry } from "../../contexts/Store";
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

const Image = styled.img<{ obtained: boolean }>`
  width: 100px;
  filter: brightness(${({ obtained }) => (obtained ? "1" : "0.02")});
  transition: filter 0.3s ease;
  :hover {
    filter: brightness(${({ obtained }) => (obtained ? "1" : "0.2")});
    cursor: url(${middleFingerCursor}), auto;
  }
`;
interface TooltipContentProps {
  name: string;
  description: string;
  timestamp?: number;
}
const TooltipContent: React.FC<TooltipContentProps> = ({
  name,
  description,
  timestamp,
}) => {
  return (
    <div>
      <h3>{name}</h3>
      <div>{description}</div>
      {timestamp && <div>{new Date(timestamp).toLocaleString("pl")}</div>}
    </div>
  );
};
interface Props {
  history: HistoryEntry[];
}
//TODO: figure out if i want to have separate achievements for each text or keep them all together or some global and
//some text specific. The thing is, if i want to use staticquery => gatsby image, i need to fetch images in react
//component
const Achievements: React.FC<Props> = ({ history }) => {
  return (
    <>
      <h1>Osiągnięcia</h1>
      <Wrapper>
        {achievements.map(achiv => {
          const { name, description, image, valueToComplete } = achiv;
          const {
            currentTimesCompleted,
            completeTimestamp: timestamp,
          } = achiv.check(history.slice());

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
                  obtained={timestamp ? true : false}
                  title={`${currentTimesCompleted}/${valueToComplete}`}
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
