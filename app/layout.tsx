import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Nav from "./components/statics/Nav";
import { ThemeProvider } from "next-themes";
import Header from "./components/statics/Header";
import { Toaster } from "react-hot-toast";

const cairo = Cairo({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "MMS",
  description: "Generated by create next app",
  icons: {
    icon: "/icon.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cairo.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="container">
            <Nav />
            <main>
              <Header />
              {children}
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  style: {
                    backgroundColor: "var(--secondary)",
                    color: "var(--text)",
                  },
                }}
              />
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
