import React from "react";
// import styled from "styled-components";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";
import { historyType } from "../../pages";
import { Container, Table } from "./styles";

interface Props {
  history: historyType[];
}

const TopRaces = ({ history }: Props) => {
  const top3 = history
    .sort((a, b) => Number(a.time) - Number(b.time))
    .slice(0, 3);

  const data = useStaticQuery(graphql`
    query {
      golden: file(relativePath: { eq: "golden_rafon.png" }) {
        childImageSharp {
          fixed(width: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
      silver: file(relativePath: { eq: "silver_rafon.png" }) {
        childImageSharp {
          fixed(width: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
      bronze: file(relativePath: { eq: "bronze_rafon.png" }) {
        childImageSharp {
          fixed(width: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
    }
  `);
  const prizes = [
    data.golden.childImageSharp.fixed,
    data.silver.childImageSharp.fixed,
    data.bronze.childImageSharp.fixed,
  ];

  return (
    <Container>
      <h1>TOP czas</h1>
      <Table>
        <thead>
          <tr>
            <td style={{ width: 25 }}>Miejsce</td>
            <td>Data</td>
            <td>Czas</td>
          </tr>
        </thead>
        <tbody>
          {top3.length ? (
            top3.map(({ id, timestamp, time }, i) => (
              <tr key={id + timestamp}>
                <td>
                  <Img fixed={prizes[i]} />
                </td>
                <td>{new Date(timestamp).toLocaleString("pl")}</td>
                <td>{time}s</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>Nie przystąpiłeś jeszcze do pisania szmaciury</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default TopRaces;
