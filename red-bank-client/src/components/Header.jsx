import { Link, NavLink } from "react-router-dom";
import Logo from "./ui/Logo";
import Button from "./ui/button";
import { Turn as Hamburger } from "hamburger-react";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Skeleton } from "./ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CiGrid41, CiLogout, CiUser } from "react-icons/ci";
import { HiOutlineHeart } from "react-icons/hi2";
import Logout from "@/lib/logout";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/navigation";

const Header = () => {
  const [isMenuOpen, setisMenuOpen] = useState(false);
  const { authData, isLoading } = useContext(AuthContext);

  const closeMenu = () => setisMenuOpen(false);

  return (
    <>
      <header className="flex justify-center p-5 py-10 fixed w-full z-50">
        <div className="w-full max-w-[1000px] inline-flex justify-between items-center border border-black/5 bg-white/90 backdrop-blur-md p-5 py-3 rounded-2xl shadow-sm">
          <Logo width="50px" />
          <nav
            className={`${
              isMenuOpen ? "block" : "hidden"
            } xl:block fixed w-full left-0 top-32 mt-5 xl:mt-0 xl:static xl:w-auto xl:flex-1 xl:flex xl:justify-center`}
          >
            <ul className="flex gap-6 text-sm font-medium bg-white border border-black/5 text-color-1/70 p-5 mx-5 rounded-xl flex-col xl:flex-row xl:p-0 xl:border-0 xl:gap-8">
               {NAV_ITEMS.map((li) => (
                <NavLink
                   key={li.path}
                  to={li.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      "hover:text-red-500 flex transition-all whitespace-nowrap",
                      isActive && "text-red-500 font-semibold",
                      li.className
                    )
                  }
                >
                  {li?.pathName}
                </NavLink>
              ))}
              {authData && (
                <NavLink
                  to={"/fundings"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      "hover:text-red-500 flex items-center gap-1 transition-all whitespace-nowrap",
                      isActive && "text-red-500 font-semibold"
                    )
                  }
                >
                  <HiOutlineHeart className="text-base" />
                  Funding
                </NavLink>
              )}
            </ul>
          </nav>
          <div className="flex items-center gap-3 justify-end shrink-0">
            <div
              className={`border border-black/5 p-1 h-fit scale-75 rounded-xl xl:hidden ${
                isMenuOpen ? "bg-black text-white" : ""
              }`}
            >
              <Hamburger
                size={30}
                toggled={isMenuOpen}
                onToggle={(toggled) => setisMenuOpen(toggled)}
              />
            </div>
            {isLoading ? (
              <Skeleton className={`w-[84px] h-10`} />
            ) : !authData ? (
              <Button asChild>
                <Link to="/auth/login" className="shrink-0">Login</Link>
              </Button>
            ) : (
              <Popover>
                <PopoverTrigger>
                  <Avatar className="ring-2 ring-red-200 hover:cursor-pointer hover:ring-4 transition-all">
                    <AvatarImage src={authData?.avatar} />
                    <AvatarFallback className="bg-red-100 text-red-600 font-semibold">
                      {authData?.name?.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent
                  className={`shadow-md text-sm p-0 mt-1 mr-8 w-[150px] z-[60]`}
                >
                  <Link
                    to="/dashboard"
                    className="px-3 items-center gap-2 hover:bg-red-50 flex py-2.5"
                  >
                    <CiGrid41 className="text-base" />
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    className="px-3 items-center gap-2 hover:bg-red-50 flex py-2.5"
                  >
                    <CiUser className="text-base" />
                    Profile
                  </Link>
                  <hr />
                  <button
                    onClick={Logout}
                    className="px-3 items-center w-full gap-2 hover:bg-red-50 text-red-500 flex py-2.5"
                  >
                    <CiLogout className="text-base" />
                    Logout
                  </button>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
