import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RoomLedger',
  description: 'Smart expense sharing for roommates',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

