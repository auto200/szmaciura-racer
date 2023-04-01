import { GamesHistoryEntry } from "@hooks/useGamesHistory";
import React, { memo } from "react";
import { Container, Table } from "./styles";

interface Props {
  history: GamesHistoryEntry[];
}
const _History: React.FC<Props> = ({ history }) => {
  return (
    <Container>
      <h1>Ostatnie {history.length <= 1 ? "podejście" : "podejścia"}</h1>
      <Table>
        <thead>
          <tr>
            <td>Data</td>
            <td>Czas</td>
          </tr>
        </thead>
        <tbody>
          {history.length ? (
            history.slice(0, 5).map(({ id, timestamp, time }) => (
              <tr key={id}>
                <td>{new Date(timestamp).toLocaleString("pl")}</td>
                <td>{time}s</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>Nie przystąpiłeś jeszcze do pisania szmaciury</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export const History = memo(_History);
