import React from "react";
import styled from "styled-components";
import { useStore } from "../../contexts/Store";
import { achievementsImgMap } from "../../achievements";

const Image = styled.img<{ notObtained: boolean }>`
  filter: brightness(${({ notObtained }) => notObtained && "0.02"});
  transition: filter 0.3s ease;
  :hover {
    filter: brightness(0.07);
  }
`;
const Achievements = () => {
  const {
    state: { achievements },
  } = useStore();
  return (
    <div>
      <h1>Osiągnięcia</h1>
      {Object.values(achievements).map(achiv =>
        achiv ? (
          <div>
            <Image
              src={achievementsImgMap[achiv.name][achiv.status.level]}
              notObtained={!achiv.status.level}
              key={achiv.name}
              title={`${achiv.status.current}/${
                achiv.steps[achiv.status.level] ||
                achiv.steps[achiv.status.level - 1]
              }`}
            />
            <p>{achiv.name}</p>
          </div>
        ) : null
      )}
    </div>
  );
};

export default Achievements;
