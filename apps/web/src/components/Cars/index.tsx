import { GamesHistoryEntry } from "@hooks/useGamesHistory";
import { UseOfflineCarAvatarsReturnType } from "@hooks/useOfflineCarAvatars";
import React, { memo, useEffect, useState } from "react";
import styled from "styled-components";
import Car from "./Car";

const CarsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

interface Props {
  history: GamesHistoryEntry[];
  cars: UseOfflineCarAvatarsReturnType["cars"];
  currentCarAvatarSrc: UseOfflineCarAvatarsReturnType["currentCarAvatarSrc"];
  setCurrentCarAvatarSrc: UseOfflineCarAvatarsReturnType["setCurrentCarAvatarSrc"];
}
const _Cars: React.FC<Props> = ({ history, cars, currentCarAvatarSrc, setCurrentCarAvatarSrc }) => {
  const [bestTime, setBestTime] = useState<number>(0);

  useEffect(() => {
    if (!history.length) return;
    const fastestTime = Number(
      history.slice().sort((a, b) => Number(a.time) - Number(b.time))[0]?.time
    );
    setBestTime(fastestTime);
  }, [history]);

  return (
    <>
      <h1>Wybierz sobie furke wariacie</h1>
      <CarsContainer>
        {cars.map((car, i) => {
          const available = !car.minSecRequired || !!(bestTime && bestTime <= car.minSecRequired);
          const handleClick = () => {
            if (available) setCurrentCarAvatarSrc(car.img);
          };
          return (
            <Car
              key={i}
              active={car.img === currentCarAvatarSrc}
              available={available}
              image={car.img}
              onClick={handleClick}
              description={car.description}
            />
          );
        })}
      </CarsContainer>
    </>
  );
};

export const Cars = memo(_Cars);
