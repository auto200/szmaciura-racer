import React from "react";
import styled from "styled-components";

const Container = styled.div`
  font-size: 1rem;
  margin-left: 5px;
  width: 5%;
`;

const Timer: React.FC<{ timePassed: string }> = ({ timePassed }) => {
  return <Container>{timePassed}s</Container>;
};

export default Timer;
