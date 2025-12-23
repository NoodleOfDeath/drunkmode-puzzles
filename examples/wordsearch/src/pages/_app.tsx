// do not modify this file
import React from 'react';

import { AppProps } from 'next/app';
import Head from 'next/head';

function App({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Head>
        <title key='title'>$displayName</title>
        <meta name="description" content="$description" />
        <meta
          key='og:title'
          property="og:title" 
          content="$displayName" />
        <meta
          key='og:description'
          property="og:description"
          content="$description" />
        <meta
          key='og:image'
          property="og:image"
          content="/sms-banner.png" />
        <meta
          key='og:url'
          property="og:url"
          content="https://www.drunkmode.app/puzzles/$appId" />
        <meta
          key='og:site_name'
          property="og:site_name"
          content="$displayName" />
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
