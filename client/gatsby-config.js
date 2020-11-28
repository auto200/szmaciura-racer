module.exports = {
  siteMetadata: {
    title: `SzmaciuraRacer - Rafonix szmaciura`,
    description: `Gra osadzona w uniwersum patostreamów, weź udział w wyścigu i pokaż kto ma najszybsze palce w mieście!`,
    author: `Zdolny Ale Leniwy`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Szmaciura Racer`,
        short_name: `SzmaciuraRacer`,
        start_url: `/`,
        background_color: `#2b2b2b`,
        theme_color: `#2b2b2b`,
        display: `minimal-ui`,
        icon: `src/assets/icon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {
        // Add any options here
      },
    },
    `gatsby-plugin-typescript`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};
