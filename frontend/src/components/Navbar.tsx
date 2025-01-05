import React from "react";
import { NavLink } from "react-router";

export const NavBarItem: React.FC<{
  children: React.ReactNode;
  href: string;
}> = ({ children, href }) => {
  return (
    <NavLink
      className={`px-3 py-2 text-sm font-medium text-white rounded-md hover:text-gray-200 `}
      to={href}
    >
      {children}
    </NavLink>
  );
};

export const Navbar: React.FC<object> = () => {
  return (
    <nav className="flex flex-wrap items-center justify-between p-6 bg-gray-800">
      <div className="flex items-center flex-shrink-0 mr-6 text-white">
        <span className="text-xl font-semibold tracking-tight">My App</span>
      </div>
      <div className="flex md:order-2">
        <NavBarItem href="/events">Events</NavBarItem>
        <NavBarItem href="/functions">Functions</NavBarItem>
      </div>
    </nav>
  );
};
