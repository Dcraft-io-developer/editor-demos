import { Outlet } from "react-router";
import { Navbar } from "./components/Navbar";

export const Layout = () => {
  return (
    <main className="h-screen text-white bg-gray-900">
      <Navbar />
      <Outlet />
    </main>
  );
};
