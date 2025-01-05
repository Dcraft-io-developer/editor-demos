import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";

import App from "./App.tsx";
import { Layout } from "./Layout.tsx";
import { Events } from "./pages/Events/index.tsx";
import NewModuleForm from "./pages/Events/Create.tsx";
import EditEvent from "./pages/Events/EditEvent.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<App />} />
          <Route path="events">
            <Route index element={<Events />} />
            <Route path="create" element={<NewModuleForm />} />
            <Route path=":id" element={<EditEvent />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
