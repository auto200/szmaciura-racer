import React, { memo } from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img, { FixedObject } from "gatsby-image";
import { Container, Table } from "./styles";
import { HistoryEntry } from "../../contexts/Store";

interface Props {
  history: HistoryEntry[];
}

const TopRaces = ({ history }: Props) => {
  const top3 = history
    .slice()
    .sort((a, b) => Number(a.time) - Number(b.time))
    .slice(0, 3);

  //could use just single image and apply filters to it. Helper -- https://codepen.io/sosuke/pen/Pjoqqp
  //filter: invert(4%) sepia(97%) saturate(472%) hue-rotate(3deg) brightness(112%) contrast(101%);
  //HOWEVER this approach makes it impossible to use different images for ex. other type of achievements
  const data = useStaticQuery(graphql`
    query {
      golden: file(relativePath: { eq: "achievements/golden_rafon.png" }) {
        childImageSharp {
          fixed(width: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
      silver: file(relativePath: { eq: "achievements/silver_rafon.png" }) {
        childImageSharp {
          fixed(width: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
      bronze: file(relativePath: { eq: "achievements/bronze_rafon.png" }) {
        childImageSharp {
          fixed(width: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
    }
  `);
  const prizes: FixedObject[] = [
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
            <td>Miejsce</td>
            <td>Data</td>
            <td>Czas</td>
          </tr>
        </thead>
        <tbody>
          {top3.length ? (
            top3.map(({ id, timestamp, time }, i) => (
              <tr key={id}>
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

export default memo(TopRaces);
