import React from 'react';

import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';

class MyDocument extends Document {

  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel='stylesheet' href='/index.css' />
          <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        </Head>
        <body className="app">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }

}

export default MyDocument;
