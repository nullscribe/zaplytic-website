import { useRef } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const menu = useRef<HTMLDivElement>(null);

  return (
    <header className="sticky top-4 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full before:absolute before:inset-0 before:max-w-7xl before:mx-2 lg:before:mx-auto before:rounded-[15px] before:bg-fg/10 before:backdrop-blur-md">
      <nav className="relative max-w-7xl w-full flex flex-wrap md:flex-nowrap basis-full items-center justify-between py-2 ps-5 pe-2 md:py-0 mx-2 lg:mx-auto">
        <div className="flex items-center">
          <Link
            className="flex gap-2 rounded-md text-2xl items-center font-semibold focus:outline-hidden focus:opacity-80"
            to="/"
            aria-label="Zaplytic"
          >
            <img src="/favicon.svg" className="h-6" alt="Zaplytic logo" />
            <span className="text-fg font-extrabold italic">Zaplytic</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 md:order-4 md:ms-4">
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => {
                if (menu.current != null) {
                  menu.current.classList.toggle("hidden");
                }
              }}
              className="hs-collapse-toggle flex justify-center items-center size-9.5 border rounded-full focus:outline-hidden border-border-strong text-fg-muted hover:bg-bg-hover focus:bg-bg-hover"
              id="hs-navbar-header-floating-collapse"
              aria-expanded="false"
              aria-controls="hs-navbar-header-floating"
              aria-label="Toggle navigation"
              data-hs-collapse="#hs-navbar-header-floating"
            >
              <svg
                aria-hidden="true"
                className="hs-collapse-open:hidden shrink-0 size-3.5"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
              <svg
                aria-hidden="true"
                className="hs-collapse-open:block hidden shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={menu}
          className="hidden overflow-hidden transition-all duration-300 basis-full grow md:block"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 md:gap-3 mt-3 md:mt-0 py-2 md:py-0 md:ps-7">
            <NavLink
              className={({ isActive, isPending }) =>
                isPending ? "" : isActive ? "activeNav" : "inActiveNav"
              }
              to="/"
              onClick={() => menu.current?.classList.toggle("hidden")}
            >
              Home
            </NavLink>
            <NavLink
              className={({ isActive, isPending }) =>
                isPending ? "" : isActive ? "activeNav" : "inActiveNav"
              }
              to="/products"
              onClick={() => menu.current?.classList.toggle("hidden")}
            >
              Products
            </NavLink>
            <NavLink
              className={({ isActive, isPending }) =>
                isPending ? "" : isActive ? "activeNav" : "inActiveNav"
              }
              to="/about"
              onClick={() => menu.current?.classList.toggle("hidden")}
            >
              About
            </NavLink>
            <NavLink
              className={({ isActive, isPending }) =>
                isPending ? "" : isActive ? "activeNav" : "inActiveNav"
              }
              to="/blog"
              onClick={() => menu.current?.classList.toggle("hidden")}
            >
              Blog
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}
