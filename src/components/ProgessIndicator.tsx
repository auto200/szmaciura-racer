import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;
const ProgressContainer = styled.div`
  flex-grow: 1;
  border-bottom: dashed 3px white;
`;
interface ImageProps {
  readonly progressInPx: string;
}
const Image = styled(Img).attrs<ImageProps>(({ progressInPx }) => ({
  style: { transform: `translateX(${progressInPx})` },
}))<ImageProps>`
  width: 100px;
  transition: transform 1s ease;
`;
const Time = styled.div`
  font-size: 1rem;
  margin-left: 5px;
  width: 5%;
`;
interface ProgressIndicatorProps {
  readonly progress: number;
  readonly timePassed: string;
}
const ProgressIndicator = ({
  progress,
  timePassed,
}: ProgressIndicatorProps) => {
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<any>(null);
  const [progressInPx, setProgressInPx] = useState<string>("0px");

  useEffect(() => {
    if (
      !progressContainerRef.current ||
      !imageRef.current ||
      !imageRef.current.imageRef.current
    )
      return;

    const containerWidth = progressContainerRef.current.clientWidth;
    const imageWidth = imageRef.current.imageRef.current.clientWidth;

    setProgressInPx(progress * (containerWidth - imageWidth) + "px");
  }, [progress]);

  const data = useStaticQuery(graphql`
    query {
      placeholderImage: file(relativePath: { eq: "rafon.png" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `);

  return (
    <Wrapper>
      <ProgressContainer ref={progressContainerRef}>
        <Image
          progressInPx={progressInPx}
          ref={imageRef}
          fixed={data.placeholderImage.childImageSharp.fixed}
        />
      </ProgressContainer>
      <Time>{timePassed}s</Time>
    </Wrapper>
  );
};

export default ProgressIndicator;
