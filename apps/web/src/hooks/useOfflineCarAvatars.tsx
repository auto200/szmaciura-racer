import { CAR_AVATARS_SRC } from "@szmaciura/shared";
import { Dispatch, SetStateAction } from "react";
import { useLocalStorage } from "usehooks-ts";

type CarAvatarSrc = (typeof CAR_AVATARS_SRC)[number];

type Car = {
  minSecRequired: number;
  img: CarAvatarSrc;
  description: string;
};

export type UseOfflineCarAvatarsReturnType = {
  currentCarAvatarSrc: CarAvatarSrc;
  setCurrentCarAvatarSrc: Dispatch<SetStateAction<CarAvatarSrc>>;
  cars: Car[];
};

export const useOfflineCarAvatars = (): UseOfflineCarAvatarsReturnType => {
  const [currentCarAvatarSrc, setCurrentCarAvatarSrc] =
    useLocalStorage<CarAvatarSrc>(
      "currentOfflineCarAvatar",
      CAR_AVATARS_SRC[0]
    );

  const cars: Car[] = [
    {
      minSecRequired: 0,
      img: CAR_AVATARS_SRC[0],
      description: "Standardowa gablota każdego pozytywnego świra",
    },
    {
      minSecRequired: 50,
      img: CAR_AVATARS_SRC[1],
      description: "Bejca za ukończenie szmaciury w co najmniej 50s",
    },
    {
      minSecRequired: 35,
      img: CAR_AVATARS_SRC[2],
      description: "35s i ta fura jest twoja",
    },
  ];

  const values = {
    currentCarAvatarSrc,
    setCurrentCarAvatarSrc,
    cars,
  };

  return values;
};
