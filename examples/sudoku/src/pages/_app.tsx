import React from 'react';

import { AppProps } from 'next/app';
import Head from 'next/head';

function App({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Head>
        <title key='title'>Sudoku</title>
        <meta name="description" content="" />
        <meta
          key='og:title'
          property="og:title" 
          content="Sudoku" />
        <meta
          key='og:description'
          property="og:description"
          content="" />
        <meta
          key='og:image'
          property="og:image"
          content="/sms-banner.png" />
        <meta
          key='og:url'
          property="og:url"
          content="https://www.drunkmode.app/puzzles/app.drunkmode.DrunkMode.sudoku" />
        <meta
          key='og:site_name'
          property="og:site_name"
          content="Sudoku" />
        <meta
          key='viewport'
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </Head>
      <Component { ...pageProps } />
    </React.Fragment>
  );
}

export default App;
