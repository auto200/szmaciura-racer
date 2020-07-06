import React, { useRef, useEffect, useState, memo } from "react";
import styled from "styled-components";
import Img from "gatsby-image";
import { useCarsContext } from "../contexts/CarsContext";

const Wrapper = styled.div`
  flex-grow: 1;
  border-bottom: dashed 3px white;
`;
interface ImageProps {
  readonly progressInPx: string;
}
//IDEA: can make like a easter egg or something and instead of translating on X axis, use scaleX, transform-origin left
// style: { transform: `scaleX(${1 + progress * (containerWidth / 250)})` },
const Image = styled(Img).attrs<ImageProps>(({ progressInPx }) => ({
  style: { transform: `translateX(${progressInPx})` },
}))<ImageProps>`
  width: 20%;
  transition: transform 1s ease;
  transform-origin: left;
`;
interface Props {
  progress: number;
}
const ProgressIndicator: React.FC<Props> = ({ progress }) => {
  const { currentImage } = useCarsContext();
  const progressWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<any>(null);
  const [progressInPx, setProgressInPx] = useState<string>("0px");

  useEffect(() => {
    if (!progressWrapperRef.current || !imageRef?.current?.imageRef?.current)
      return;

    const containerWidth = progressWrapperRef.current.clientWidth;
    const imageWidth = imageRef.current.imageRef.current.clientWidth;

    setProgressInPx(progress * (containerWidth - imageWidth) + "px");
  }, [progress]);

  return (
    <Wrapper ref={progressWrapperRef}>
      <Image progressInPx={progressInPx} ref={imageRef} fluid={currentImage} />
    </Wrapper>
  );
};

export default memo(ProgressIndicator);
