import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Taka Ticket — Request Pembuatan Website",
  description:
    "Kirim brief proyek dan kebutuhan website kamu ke Taka Ticket. Kami bantu wujudkan website modern, cepat, dan profesional.",
  metadataBase: new URL("https://taka-ticket.example.com"),
  openGraph: {
    title: "Taka Ticket — Request Pembuatan Website",
    description:
      "Agency website development modern. Kirim brief proyekmu sekarang.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(17, 20, 27, 0.92)",
              color: "#F9FAFB",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              fontSize: "14px",
              padding: "12px 14px",
            },
            success: {
              iconTheme: { primary: "#A78BFA", secondary: "#0B0D12" },
            },
            error: {
              iconTheme: { primary: "#FB7185", secondary: "#0B0D12" },
            },
          }}
        />
      </body>
    </html>
  );
}
