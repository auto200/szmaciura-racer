import React from "react";
// import styled from "styled-components";
import { historyType } from "../../pages";
import { Container, Table } from "./styles";

interface Props {
  history: historyType[];
}
const History = ({ history }: Props) => {
  return (
    <Container>
      <h1>Ostatinie {history.length <= 1 ? "podejście" : "podejścia"}</h1>
      <Table>
        <thead>
          <tr>
            <td>Data</td>
            <td>Czas</td>
          </tr>
        </thead>
        <tbody>
          {history.length ? (
            history
              .slice(0, 10)
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(({ id, timestamp, time }) => (
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

export default History;
