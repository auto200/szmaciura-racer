/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import Head from "next/head";
import React from "react";

interface Props {
  description?: string;
  lang?: string;
  meta?: object[];
  title?: string;
}

const SEO: React.FC<Props> = ({
  description = "",
  lang = "pl",
  meta = [],
  title = "",
}) => {
  const metaDescription = description || "szmaciura";

  return (
    <Head
    // TODO
    // htmlAttributes={{
    //   lang,
    // }}
    // title={site.siteMetadata.title}
    // meta={[
    //   {
    //     name: `description`,
    //     content: metaDescription,
    //   },
    //   {
    //     property: `og:title`,
    //     content: site.siteMetadata.title,
    //   },
    //   {
    //     property: `og:description`,
    //     content: metaDescription,
    //   },
    //   {
    //     property: `og:type`,
    //     content: `website`,
    //   },
    //   {
    //     name: `twitter:card`,
    //     content: `summary`,
    //   },
    //   {
    //     name: `twitter:creator`,
    //     content: site.siteMetadata.author,
    //   },
    //   {
    //     name: `twitter:title`,
    //     content: title,
    //   },
    //   {
    //     name: `twitter:description`,
    //     content: metaDescription,
    //   },
    //   {
    //     property: `og:image`,
    //     content: `${process.env.WEBSITE_URL}/rafonix-szmaciura.jpg`,
    //   },
    //   {
    //     property: `og:url`,
    //     content: `${process.env.WEBSITE_URL}`,
    //   },
    // ].concat(meta as [])}
    >
      <link rel="cannonical" href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}`} />
    </Head>
  );
};

export default SEO;
