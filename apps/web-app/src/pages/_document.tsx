import { Head, Html, Main, NextScript } from "next/document";

const Document = () => {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=optional"
        />
      </Head>
      <body className="bg-theme text-white scrollbar-hide">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
