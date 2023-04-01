import { Player } from "@szmaciura/shared";
import isEqual from "lodash/isEqual";
import NextImage from "next/image";
import React, { memo, useRef } from "react";
import styled, { css } from "styled-components";

const Wrapper = styled.div`
  flex-grow: 1;
  border-bottom: dashed 3px white;
`;
interface ImageWrapperProps {
  progressInPx: string;
  highlight: boolean;
}
//IDEA: can make like a easter egg or something and instead of translating on X axis, use scaleX, transform-origin left
// style: { transform: `scaleX(${1 + progress * (containerWidth / 250)})` },
const ImageWrapper = styled.div.attrs<ImageWrapperProps>(
  ({ progressInPx }) => ({
    style: { transform: `translateX(${progressInPx})` },
  })
)<ImageWrapperProps>`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 150px;
  height: 100px;
  transition: transform 1s ease;
  z-index: ${({ highlight }) => highlight && 10};
  ${({ highlight, theme }) =>
    highlight &&
    css`
      ::before {
        content: "";
        position: absolute;
        top: -20px;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: 0;
        height: 0;
        border-left: 20px solid transparent;
        border-right: 20px solid transparent;
        border-top: 20px solid ${theme.colors.golden};

        animation: move 2s ease-in-out infinite alternate;
        @keyframes move {
          0% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(5px);
          }
        }
      }
    `}
`;
interface ImageProps {
  $highlight: boolean;
}
const Image = styled(NextImage)<ImageProps>`
  ${({ $highlight, theme }) =>
    $highlight &&
    `filter: drop-shadow(3px 3px 0 ${theme.colors.secondary}) drop-shadow(-3px -3px 0 ${theme.colors.secondary})`}
`;

interface Props {
  players: Player[];
  highlightPlayer?: string;
}

const ProgressIndicator: React.FC<Props> = ({ players, highlightPlayer }) => {
  const progressWrapperRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<any>({});

  const getProgressInPx = (playerId: string, progress: number): string => {
    if (!progressWrapperRef.current || !imageRefs?.current[playerId])
      return "0px";

    const containerWidth = progressWrapperRef.current.clientWidth;
    const imageWidth = imageRefs.current[playerId].clientWidth;

    return progress * (containerWidth - imageWidth) + "px";
  };

  return (
    <Wrapper ref={progressWrapperRef}>
      <div style={{ width: "20%", height: 150, position: "relative" }}>
        {players.map(({ id, progress, carAvatarSrc }) => (
          <ImageWrapper
            key={id}
            progressInPx={getProgressInPx(id, progress)}
            ref={(ref) => (imageRefs.current[id] = ref)}
            highlight={id === highlightPlayer}
          >
            <Image
              alt={""}
              src={carAvatarSrc}
              $highlight={id === highlightPlayer}
              width={150}
              height={100}
            />
          </ImageWrapper>
        ))}
      </div>
    </Wrapper>
  );
};

export default memo(ProgressIndicator, (prev, next) => isEqual(prev, next));
