import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStaticQuery, graphql } from "gatsby";
import { FluidObject } from "gatsby-image";

interface State {
  currentCarIndex: number;
  setCurrentCarIndex: any;
  cars: Car[];
}
const CarContext = createContext<State>({
  currentCarIndex: 0,
  setCurrentCarIndex: () => {},
  cars: [],
});

export interface Car {
  minSecRequired: number;
  img: FluidObject;
  description: string;
}

const CarsContextProvider = ({ children }: { children: ReactNode }) => {
  const data = useStaticQuery(graphql`
    query {
      progress: file(relativePath: { eq: "cars/progress.png" }) {
        childImageSharp {
          fluid(maxWidth: 250) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
      progress2: file(relativePath: { eq: "cars/progress2.png" }) {
        childImageSharp {
          fluid(maxWidth: 250) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
      progress3: file(relativePath: { eq: "cars/progress3.png" }) {
        childImageSharp {
          fluid(maxWidth: 250) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `);
  const [currentCarIndex, setCurrentCarIndex] = useState<number>(0);
  const firstRenderRef = useRef(true);
  const [cars] = useState<Car[]>([
    {
      minSecRequired: 0,
      img: data.progress.childImageSharp.fluid,
      description: "Standardowa gablota każdego pozytywnego świra",
    },
    {
      minSecRequired: 50,
      img: data.progress2.childImageSharp.fluid,
      description: "Bejca za ukończenie szmaciury w co najmniej 50s",
    },
    {
      minSecRequired: 35,
      img: data.progress3.childImageSharp.fluid,
      description: "35s i ta fura jest twoja",
    },
  ]);

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
