import React from "react";
import styled from "styled-components";
import { historyType } from "../pages";

const Container = styled.div`
  width: 100%;
  margin-top: 20px;
  text-align: center;
`;
const Table = styled.table`
  margin: 0 auto;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-collapse: collapse;
  width: 500px;
  justify-self: center;
  thead {
    border: 2px solid ${({ theme }) => theme.colors.secondary};
    font-weight: bold;
  }
  td {
    border: 1px solid ${({ theme }) => theme.colors.secondary};
    padding: 3px;
  }
`;

interface Props {
  history: historyType;
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
            history.slice(0, 10).map(({ id, timestamp, time }) => (
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
