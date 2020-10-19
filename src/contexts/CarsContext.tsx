import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useStaticQuery, graphql } from "gatsby";
import { FluidObject } from "gatsby-image";

interface State {
  currentImage: FluidObject;
  currentCarIndex?: number;
  setCurrentCarIndex: any;
  cars: CarI[];
}
const CarContext = createContext<State>({
  currentImage: {} as FluidObject,
  currentCarIndex: 0,
  setCurrentCarIndex: () => {},
  cars: [],
});

export interface CarI {
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
  const [currentCarIndex, setCurrentCarIndex] = useState<number>();

  const [cars] = useState<CarI[]>([
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
  const [currentImage, setCurrentImage] = useState<FluidObject>(
    cars[currentCarIndex || 0].img
  );

  useEffect(() => {
    if (currentCarIndex === undefined) {
      try {
        const storedCarIndex = window.localStorage.getItem("currentCarIndex");
        if (storedCarIndex) {
          setCurrentCarIndex(Number(storedCarIndex) || 0);
        } else {
          throw new Error();
        }
      } catch (err) {
        //data corrupted or smth
        setCurrentCarIndex(0);
      }
    } else {
      setCurrentImage(cars[currentCarIndex].img);
      try {
        window.localStorage.setItem(
          "currentCarIndex",
          currentCarIndex.toString()
        );
      } catch (err) {}
    }
  }, [currentCarIndex]);

  const values = {
    currentImage,
    currentCarIndex,
    setCurrentCarIndex,
    cars,
  };

  return <CarContext.Provider value={values}>{children}</CarContext.Provider>;
};

export default CarsContextProvider;

export const useCarsContext = () => useContext(CarContext);
