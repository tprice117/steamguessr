import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import "./style.css";

function App() {
  return (
    <BrowserRouter>
      <nav
        className="navbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "#333",
          padding: "0.5rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: "#fff", fontWeight: "bold", fontSize: "1.2rem" }}>
          SteamGuessr!
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            className="nav-link"
            to="/"
            title="Home"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            <span
              style={{ color: "#fff", fontWeight: "bold", fontSize: "1.2rem" }}
            >
              Home
            </span>
          </Link>
          <Link
            className="nav-link"
            to="/about"
            title="About"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            <span
              style={{ color: "#fff", fontWeight: "bold", fontSize: "1.2rem" }}
            >
              About
            </span>
          </Link>
          <a
            className="nav-link"
            href="https://github.com/tprice117/steamguessr"
            target="_blank"
            title="GitHub"
            style={{ display: "flex", alignItems: "center" }}
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="white"
              className="git-button"
              viewBox="0 0 16 16"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
            </svg>
          </a>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
