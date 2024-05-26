import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="32x32" href="/images/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon.ico"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/favicon.ico"
        />
      </Head>
      <body>
        <div className="dark:absolute dark:w-80 dark:h-80 dark:bg-[#407EF7] dark:right-0 dark:blur-[50px] dark:opacity-10 dark:rounded-[50%]" />
        <div className="dark:absolute dark:w-80 dark:h-80 dark:bg-[#205BCD] dark:top-44 dark:blur-[50px] dark:opacity-20 dark:rounded-[50%]" />
        <div className="dark:absolute dark:w-80 dark:h-80 dark:bg-[#205BCD] dark:-bottom-40 dark:left-0 dark:blur-[50px] dark:opacity-20 dark:rounded-[50%]" />

        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
