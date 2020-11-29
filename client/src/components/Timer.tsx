import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import styled from "styled-components";
import { getTimePassedInSecAndMs } from "@shared/utils";

const Container = styled.div`
  font-size: 1rem;
  margin-left: 5px;
  width: 5%;
`;

export interface TimerFunctions {
  start: () => void;
  reset: () => void;
  getTime: () => string;
  stop: () => void;
}

const Timer: React.ForwardRefRenderFunction<TimerFunctions> = (
  _,
  forwardedRef
) => {
  const [timePassed, setTimePassed] = useState<string>("0");
  const startTimestampRef = useRef<number>();
  const timerAnimationFrameRef = useRef<number>();
  const timePassedRef = useRef<string>("0");

  useEffect(() => {
    timePassedRef.current = timePassed;
  }, [timePassed]);

  const updateTimer = () =>
    requestAnimationFrame(() => {
      if (startTimestampRef.current) {
        const seconds = getTimePassedInSecAndMs(startTimestampRef.current);
        setTimePassed(seconds);
        timerAnimationFrameRef.current = updateTimer();
      }
    });

  useImperativeHandle(forwardedRef, () => ({
    start: () => {
      startTimestampRef.current = Date.now();
      if (!timerAnimationFrameRef.current) {
        timerAnimationFrameRef.current = updateTimer();
      }
    },
    reset: () => {
      if (timerAnimationFrameRef.current) {
        cancelAnimationFrame(timerAnimationFrameRef?.current);
      }
      startTimestampRef.current = undefined;
      timerAnimationFrameRef.current = undefined;
      setTimePassed("0");
    },
    stop: () => {
      if (timerAnimationFrameRef.current) {
        cancelAnimationFrame(timerAnimationFrameRef?.current);
      }
    },
    getTime: () => timePassedRef.current,
  }));
  return <Container>{timePassed}s</Container>;
};

export default React.forwardRef(Timer);
