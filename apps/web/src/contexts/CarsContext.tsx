import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface State {
  currentCarIndex: number;
  setCurrentCarIndex: React.Dispatch<React.SetStateAction<number>>;
  cars: Car[];
}
const CarContext = createContext<State>({
  currentCarIndex: 0,
  setCurrentCarIndex: () => {},
  cars: [],
});

interface Car {
  minSecRequired: number;
  img: string;
  description: string;
}

const CarsContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentCarIndex, setCurrentCarIndex] = useState<number>(0);
  const firstRenderRef = useRef(true);
  const cars: Car[] = [
    {
      minSecRequired: 0,
      img: "/cars/progress.png",
      description: "Standardowa gablota każdego pozytywnego świra",
    },
    {
      minSecRequired: 50,
      img: "/cars/progress1.png",
      description: "Bejca za ukończenie szmaciury w co najmniej 50s",
    },
    {
      minSecRequired: 35,
      img: "/cars/progress2.png",
      description: "35s i ta fura jest twoja",
    },
  ];

  useEffect(() => {
    if (firstRenderRef.current) {
      try {
        const storedCarIndex = window.localStorage.getItem("currentCarIndex");
        if (storedCarIndex) {
          setCurrentCarIndex(Number(storedCarIndex) || 0);
        } else {
          throw new Error();
        }
      } catch (err) {
        //data corrupted or no data stored
        setCurrentCarIndex(0);
      }
      firstRenderRef.current = false;
    } else {
      try {
        window.localStorage.setItem(
          "currentCarIndex",
          currentCarIndex.toString()
        );
      } catch (err) {}
    }
  }, [currentCarIndex]);

  const values = {
    currentCarIndex,
    setCurrentCarIndex,
    cars,
  };

  return <CarContext.Provider value={values}>{children}</CarContext.Provider>;
};

export default CarsContextProvider;

export const useCarsContext = () => useContext(CarContext);
