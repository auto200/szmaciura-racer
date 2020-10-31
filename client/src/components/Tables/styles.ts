import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  margin-top: 20px;
  text-align: center;
`;

export const Table = styled.table`
  max-width: 100vw;
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
