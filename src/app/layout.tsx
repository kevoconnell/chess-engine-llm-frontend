import "./globals.css";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LLM Plays Chess",
  description: "LLM Plays Chess",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body>
        {children}
        <footer
          style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            padding: "1rem",
            textAlign: "center",
            color: "#FFFFFF",
          }}
        >
          <a
            href="https://x.com/kw0ETH"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "none",
              marginRight: "1rem",
            }}
          >
            Made by @kw0ETH
          </a>
          <a
            href="https://github.com/kevoconnell/chess-engine-llm-frontend"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <i className="fab fa-github" style={{ fontSize: "1.2rem" }}></i>
          </a>
        </footer>
      </body>
    </html>
  );
}
