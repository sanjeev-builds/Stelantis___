import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hackathon MVP",
  description: "Stellantis Tech Hackathon dashboard shell",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
