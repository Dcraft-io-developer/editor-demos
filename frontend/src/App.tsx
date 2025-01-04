// src/App.tsx
import React from "react";
import { Navbar } from "./components/Navbar";
import { Page } from "./types";

const App: React.FC = () => {
  const [page, setPage] = React.useState<Page>("events");
  return (
    <main className="h-screen bg-gray-900">
      <Navbar page={page} setPage={setPage} />
    </main>
  );
};

export default App;
