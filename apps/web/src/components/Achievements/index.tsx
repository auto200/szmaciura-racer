import { GamesHistoryEntry } from "@hooks/useGamesHistory";
import Tippy from "@tippyjs/react";
import NextImage from "next/image";
import React, { memo } from "react";
import styled from "styled-components";
import "tippy.js/dist/tippy.css";
import achievements from "./achievements";

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

const Image = styled(NextImage)<{ $obtained: boolean }>`
  filter: brightness(${({ $obtained }) => ($obtained ? "1" : "0.02")});
  transition: filter 0.3s ease;
  :hover {
    filter: brightness(${({ $obtained }) => ($obtained ? "1" : "0.2")});
    cursor: url(/middleFingerCursor.png), auto;
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
  history: GamesHistoryEntry[];
}
//TODO: figure out if i want to have separate achievements for each text or keep
//them all together or some global and some text specific.
const _Achievements: React.FC<Props> = ({ history }) => {
  return (
    <>
      <h1>Osiągnięcia</h1>
      <Wrapper>
        {achievements.map((achiv) => {
          const { name, description, image, valueToComplete } = achiv;
          const { currentTimesCompleted, completeTimestamp: timestamp } =
            achiv.check(history.slice());

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
                  alt={`${currentTimesCompleted}/${valueToComplete}`}
                  src={image}
                  $obtained={timestamp ? true : false}
                  title={`${currentTimesCompleted}/${valueToComplete}`}
                  width={100}
                  height={100}
                />
              </div>
            </Tooltip>
          );
        })}
      </Wrapper>
    </>
  );
};

export const Achievements = memo(_Achievements);
