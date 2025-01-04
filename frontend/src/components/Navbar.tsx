import React from "react";
import { Page } from "../types";

export const NavBarItem: React.FC<{
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  nowPage?: Page;
  page: Page;
}> = ({ children, onClick, nowPage, page }) => {
  return (
    <button
      className={`px-3 py-2 text-sm font-medium text-white rounded-md hover:text-gray-200 ${
        page === nowPage ? "bg-gray-900" : ""
      }`}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
};

export const Navbar: React.FC<{
  page: Page;
  setPage: (page: Page) => void;
}> = ({ page, setPage }) => {
  return (
    <nav className="flex flex-wrap items-center justify-between p-6 bg-gray-800">
      <div className="flex items-center flex-shrink-0 mr-6 text-white">
        <span className="text-xl font-semibold tracking-tight">My App</span>
      </div>
      <div className="flex md:order-2">
        <NavBarItem
          onClick={() => setPage("events")}
          nowPage={page}
          page="events"
        >
          Events
        </NavBarItem>
        <NavBarItem
          onClick={() => setPage("functions")}
          nowPage={page}
          page="functions"
        >
          Functions
        </NavBarItem>
      </div>
    </nav>
  );
};
