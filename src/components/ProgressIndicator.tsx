import React, { useRef, useEffect, useState, memo } from "react";
import styled from "styled-components";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";

const Wrapper = styled.div`
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
interface ProgressIndicatorProps {
  readonly progress: number;
}
const ProgressIndicator = ({ progress }: ProgressIndicatorProps) => {
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
    <Wrapper ref={progressWrapperRef}>
      <Image
        progressInPx={progressInPx}
        ref={imageRef}
        fixed={data.placeholderImage.childImageSharp.fixed}
      />
    </Wrapper>
  );
};

export default memo(ProgressIndicator);
