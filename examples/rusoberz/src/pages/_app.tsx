import React from 'react';

import { AppProps } from 'next/app';
import Head from 'next/head';

function App({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Head>
        <title key='title'>R U SOBERZ?</title>
        <meta name="description" content="" />
        <meta
          key='og:title'
          property="og:title" 
          content="R U SOBERZ?" />
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
          content="https://www.drunkmode.app/puzzles/app.drunkmode.DrunkMode.rusoberz" />
        <meta
          key='og:site_name'
          property="og:site_name"
          content="R U SOBERZ?" />
        <meta
          key='viewport'
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Head>
      <Component { ...pageProps } />
    </React.Fragment>
  );
}

export default App;
