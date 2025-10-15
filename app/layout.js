import './globals.css';
console.log('Layout rendered with globals.css');

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
