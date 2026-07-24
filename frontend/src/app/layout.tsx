import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata = {
  title: "Stellantis Cloud Vehicle Health & Predictive Maintenance",
  description: "Connected vehicle health dashboard, telemetry analytics, and predictive maintenance platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-400 font-mono">
          STELLANTIS TECH HACKATHON · SDV CONNECTED VEHICLE PLATFORM · STACK: NEXT.JS 15 + FASTAPI + GEMINI API + SQLITE
        </footer>
      </body>
    </html>
  );
}
