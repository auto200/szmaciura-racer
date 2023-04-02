import { GamesHistoryEntry } from "@hooks/useGamesHistory";
import NextImage from "next/image";
import { memo } from "react";
import { Container, Table } from "./styles";

//could use just single image and apply filters to it. Helper -- https://codepen.io/sosuke/pen/Pjoqqp
//filter: invert(4%) sepia(97%) saturate(472%) hue-rotate(3deg) brightness(112%) contrast(101%);
//HOWEVER this approach makes it impossible to use different images for ex. other type of achievements
const prizeImages = [
  "/achievements/golden_rafon.png",
  "/achievements/silver_rafon.png",
  "/achievements/bronze_rafon.png",
] as const;

type TopRacesProps = {
  history: GamesHistoryEntry[];
};
const _TopRaces = ({ history }: TopRacesProps) => {
  const top3 = history
    .slice()
    .sort((a, b) => Number(a.time) - Number(b.time))
    .slice(0, 3)
    .map((entry, i) => ({
      ...entry,
      imageSrc: prizeImages[i] || prizeImages[0],
    }));

  return (
    <Container>
      <h1>TOP czas</h1>
      <Table>
        <thead>
          <tr>
            <td>Miejsce</td>
            <td>Data</td>
            <td>Czas</td>
          </tr>
        </thead>
        <tbody>
          {top3.length === 0 && (
            <tr>
              <td colSpan={3}>Nie przystąpiłeś jeszcze do pisania szmaciury</td>
            </tr>
          )}
          {top3.map(({ id, timestamp, time, imageSrc }, i) => (
            <tr key={id}>
              <td>
                <NextImage src={imageSrc} alt={`miejsce ${i + 1}`} width={200} height={200} />
              </td>
              <td>{new Date(timestamp).toLocaleString("pl")}</td>
              <td>{time}s</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export const TopRaces = memo(_TopRaces);
