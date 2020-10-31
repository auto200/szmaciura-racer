import React, { useState, useEffect, memo } from "react";
import styled from "styled-components";
import { History } from "../../contexts/Store";
import { useCarsContext } from "../../contexts/CarsContext";
import Car from "./Car";

const Wrapper = styled.div`
  text-align: center;
`;
const CarsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

interface Props {
  history: History[];
}
const Cars: React.FC<Props> = ({ history }) => {
  const { cars, setCurrentCarIndex, currentCarIndex } = useCarsContext();
  const [bestTime, setBestTime] = useState<number>(0);

  useEffect(() => {
    if (!history.length) return;
    const shortestTime = Number(
      history.slice().sort((a, b) => Number(a.time) - Number(b.time))[0].time
    );
    setBestTime(shortestTime);
  }, [history]);

  return (
    <Wrapper>
      <h1>Wybierz sobie furke wariacie</h1>
      <CarsContainer>
        {cars.map((car, i) => {
          const available =
            !car.minSecRequired ||
            !!(bestTime && bestTime <= car.minSecRequired);
          const handleClick = () => {
            if (available) setCurrentCarIndex(i);
          };
          return (
            <Car
              key={i}
              active={currentCarIndex === i}
              available={available}
              image={car.img}
              onClick={handleClick}
              description={car.description}
            />
          );
        })}
      </CarsContainer>
    </Wrapper>
  );
};

export default memo(Cars);
