import Head from "next/head";
import { ThemeType } from "../types";

interface ThemeHeadProps {
  theme: ThemeType;
}

export function ThemeHead({ theme }: ThemeHeadProps) {
  return (
    <Head>
      {theme === "modern" && (
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      )}
      {theme === "elegant" && (
        <>
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&display=swap"
            rel="stylesheet"
          />
        </>
      )}
    </Head>
  );
}
