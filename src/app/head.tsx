export default function Head() {
  return (
    <>
      {/* Remove .ico favicon and force .png for all browsers */}
      <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
      <link rel="icon" href="/favicon.png" type="image/png" sizes="16x16" />
      <link rel="apple-touch-icon" href="/favicon.png" />
      <meta name="msapplication-TileImage" content="/favicon.png" />
      <meta name="theme-color" content="#ffffff" />

      {/* Initio theme fonts */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Alice&family=Open+Sans:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
    </>
  );
}
