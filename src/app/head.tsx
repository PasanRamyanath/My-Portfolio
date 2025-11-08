export default function Head() {
  return (
    <>
      {/* Remove .ico favicon and force .png for all browsers */}
      <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
      <link rel="icon" href="/favicon.png" type="image/png" sizes="16x16" />
      <link rel="apple-touch-icon" href="/favicon.png" />
      <meta name="msapplication-TileImage" content="/favicon.png" />
      <meta name="theme-color" content="#0b1220" />
    </>
  );
}
