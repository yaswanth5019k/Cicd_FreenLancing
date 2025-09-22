import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from  "../context/AuthContext";
import Script from 'next/script'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Arbeit - Professional Job Search Portal",
  description: "Create professional resumes, find your dream job, and get insights with our ATS-friendly platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Lato:wght@400;700&family=Open+Sans:wght@400;600&family=Montserrat:wght@500;600;700&family=Poppins:wght@400;500;600&family=Raleway:wght@400;600&family=Quicksand:wght@400;500;600&family=Playfair+Display:wght@400;600&family=Bebas+Neue&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body className={poppins.variable}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"
        strategy="afterInteractive"
      />
    </html>
  );
}
