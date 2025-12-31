import Head from 'next/head';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>ReWear - Community Clothing Exchange</title>
                <meta name="description" content="Exchange unused clothing through direct swaps or points. Promote sustainable fashion and reduce textile waste." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}
