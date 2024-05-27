// do not modify this file
import React from 'react';

import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { resetServerContext } from 'react-beautiful-dnd';

class MyDocument extends Document {

  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    resetServerContext();
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel='stylesheet' href='./index.css' />
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
