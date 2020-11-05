import React, { useRef, memo } from "react";
import styled from "styled-components";
import Img from "gatsby-image";
import { Player } from "../../../shared/interfaces";
import { useCarsContext } from "../contexts/CarsContext";
import { isEqual } from "lodash";

const Wrapper = styled.div`
  flex-grow: 1;
  border-bottom: dashed 3px white;
`;
interface ImageWrapperProps {
  readonly progressInPx: string;
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
`;
interface ImageProps {
  highlight: boolean;
}
const Image = styled(Img)<ImageProps>`
  width: 100%;
  height: 100%;
  ${({ highlight }) =>
    highlight &&
    `filter: drop-shadow(1px 1px 0 white) drop-shadow(-1px -1px 0 white)`}
`;
interface Props {
  players: Player[];
  highlightPlayer?: string;
}
//TODO: allow multiple cars racing in the same axis for online mode
const ProgressIndicator: React.FC<Props> = ({ players, highlightPlayer }) => {
  const progressWrapperRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<any>({});
  const { cars } = useCarsContext();

  const getProgressinPx = (playerId: string, progress: number): string => {
    if (!progressWrapperRef.current || !imageRefs?.current[playerId])
      return "0px";

    const containerWidth = progressWrapperRef.current.clientWidth;
    const imageWidth = imageRefs.current[playerId].clientWidth;

    return progress * (containerWidth - imageWidth) + "px";
  };

  return (
    <Wrapper ref={progressWrapperRef}>
      <div style={{ width: "20%", height: 150, position: "relative" }}>
        {players.map(({ id, progress, carIndex }) => (
          <ImageWrapper
            key={id}
            progressInPx={getProgressinPx(id, progress)}
            ref={ref => (imageRefs.current[id] = ref)}
          >
            <Image
              //@ts-ignore
              fluid={cars[carIndex].img}
              highlight={id === highlightPlayer}
              imgStyle={{
                objectFit: "contain",
                objectPosition: "center bottom",
              }}
            />
          </ImageWrapper>
        ))}
      </div>
    </Wrapper>
  );
};

export default memo(ProgressIndicator, (prev, next) => isEqual(prev, next));
