import {
  Link,
  NavLink,
  Outlet,
  ScrollRestoration,
} from "react-router-dom";
import { CiGrid41, CiLogout, CiUser } from "react-icons/ci";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Sling as Hamburger } from "hamburger-react";
import Logout from "@/lib/logout";
import { motion } from "motion/react";
import { GoBlocked, GoPlus } from "react-icons/go";
import { SlList } from "react-icons/sl";
import {
  PiDropThin,
  PiGlobeThin,
  PiSidebarSimpleThin,
  PiUsersThreeThin,
} from "react-icons/pi";
import { HelmetProvider } from "react-helmet-async";
import Logo from "@/components/ui/Logo";
import PropTypes from "prop-types";

const DashboardLayout = () => {
  const { authData } = useContext(AuthContext);

  return (
    <HelmetProvider>
      <section className="flex justify-center">
        <div className="w-full inline-flex gap-5 flex-col xl:flex-row xl:max-h-screen xl:h-screen">
          <SideBar className={`hidden xl:block`} />
          <div className="w-full min-w-0 p-5 flex flex-col gap-5">
            <DashboardHeader />
            {authData?.status === "blocked" && (
              <motion.div
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                className="bg-orange-500/80 border border-orange-500/20 rounded-xl text-white flex justify-between items-center px-5 py-3"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <GoBlocked size={28} /> Your account blocked
                </h2>
                <Link to={`/#contact`}>Review</Link>
              </motion.div>
            )}
            <Outlet />
            <span className="flex pb-20"></span>
          </div>
        </div>
      </section>
      <ScrollRestoration />
    </HelmetProvider>
  );
};

export default DashboardLayout;

const NavLinkItem = ({ link, onNavigate, end }) => (
  <NavLink
    to={link.path}
    end={end}
    onClick={onNavigate}
    className={({ isActive }) =>
      `px-5 w-full py-[10px] flex items-center gap-3 border rounded-lg font-medium transition-colors whitespace-nowrap text-base ${
        isActive ? "bg-red-500 text-white border-red-500" : "hover:bg-red-50 hover:text-red-600"
      }`
    }
  >
    <span className="text-2xl">{link?.icon}</span>
    {link?.pathName}
  </NavLink>
);

NavLinkItem.propTypes = {
  link: PropTypes.shape({
    path: PropTypes.string.isRequired,
    pathName: PropTypes.string.isRequired,
    icon: PropTypes.node,
  }).isRequired,
  onNavigate: PropTypes.func,
  end: PropTypes.bool,
};

const SectionHeading = ({ children }) => (
  <div className="flex gap-2 items-center">
    <h4 className="text-sm font-semibold text-color-1/60 uppercase tracking-wide">
      {children}
    </h4>
    <hr className="flex-grow border-red-100" />
  </div>
);

SectionHeading.propTypes = {
  children: PropTypes.node,
};

const NavList = ({ onNavigate }) => {
  const { authData } = useContext(AuthContext);

  return (
    <ul className="pt-10 space-y-5">
      {SidebarLinks.map((link, index) => (
        <NavLinkItem key={index} link={link} onNavigate={onNavigate} end={index === 0} />
      ))}
      {authData?.role === "admin" && (
        <>
          <SectionHeading>Admin</SectionHeading>
          {AdminSideBarData.map((link, index) => (
            <NavLinkItem key={index} link={link} onNavigate={onNavigate} />
          ))}
        </>
      )}
      {authData?.role === "volunteer" && (
        <>
          <SectionHeading>Volunteer</SectionHeading>
          {VolunteerSideBarData.map((link, index) => (
            <NavLinkItem key={index} link={link} onNavigate={onNavigate} />
          ))}
        </>
      )}
      <button
        onClick={Logout}
        className="px-5 w-full py-[10px] flex items-center gap-3 border rounded-lg font-medium transition-colors whitespace-nowrap text-base hover:bg-red-50 hover:text-red-600"
      >
        <span className="text-2xl">
          <CiLogout />
        </span>
        Logout
      </button>
    </ul>
  );
};

NavList.propTypes = {
  onNavigate: PropTypes.func,
};

const SideBar = ({ className, ...props }) => {
  return (
    <div
      className={`w-[340px] hidden xl:block px-5 py-5 pr-6 border bg-white ${className}`}
      {...props}
    >
      <div className="flex w-full justify-between">
        <Logo />
      </div>
      <NavList />
    </div>
  );
};

SideBar.propTypes = {
  className: PropTypes.string,
};

const SidebarLinks = [
  {
    path: "/dashboard",
    pathName: "Dashboard",
    icon: <CiGrid41 />,
  },
  {
    path: "/dashboard/my-donation-request",
    pathName: "My Donation Request",
    icon: <SlList />,
  },
  {
    path: "/dashboard/create-donation-request",
    pathName: "Create Donation Request",
    icon: <GoPlus />,
  },
  {
    path: "/dashboard/profile",
    pathName: "Profile",
    icon: <CiUser />,
  },
];

const DashboardHeader = () => {
  const { authData } = useContext(AuthContext);
  const [isSideBarOpen, setisSideBarOpen] = useState(false);

  return (
    <>
      <div className="bg-white p-5 rounded-lg flex justify-between items-center gap-5">
        <div className="flex items-center gap-5">
          <div className="loading md:hidden">
            <Logo />
          </div>
          <div className="overflow-hidden">
            <h2 className="capitalize text-xl md:text-2xl font-bold hidden min-[450px]:block">
              Dashboard
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Link
             to="/"
             aria-label="Open public site"
             className="bg-red-500 text-white p-2 rounded-xl scale-90 hover:bg-red-700"
           >
             <PiGlobeThin size={30} aria-hidden="true" />
           </Link>
          <Link to={`/dashboard/profile`} className="flex gap-4">
            <Avatar className="ring-2 ring-red-200 hover:cursor-pointer hover:ring-4">
              <AvatarImage src={authData?.avatar} />
              <AvatarFallback>
                {authData?.name?.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <h3 className="font-bold">{authData?.name}</h3>
              <p className="text-sm -mt-1">
                {authData?.email?.slice(0, 15)}....
              </p>
            </div>
          </Link>
          <div className="xl:hidden">
            <Hamburger
              onToggle={(toggled) => {
                setisSideBarOpen(toggled);
              }}
            />
          </div>
        </div>
      </div>
      {isSideBarOpen && (
        <div className="absolute w-full left-0 p-5 z-50 mt-20 xl:hidden">
          <div className={`w-full px-5 py-5 pr-10 border bg-white rounded-xl`}>
            <NavList onNavigate={() => setisSideBarOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

const AdminSideBarData = [
  {
    path: "/dashboard/all-users",
    pathName: "All Users",
    icon: <PiUsersThreeThin />,
  },
  {
    path: "/dashboard/all-blood-donation-request",
    pathName: "All Donation Req",
    icon: <PiDropThin />,
  },
  {
    path: "/dashboard/content-management",
    pathName: "Content Management",
    icon: <PiSidebarSimpleThin />,
  },
];

const VolunteerSideBarData = [
  {
    path: "/dashboard/all-blood-donation-request",
    pathName: "All Donation Req",
    icon: <PiDropThin />,
  },
  {
    path: "/dashboard/content-management",
    pathName: "Content Management",
    icon: <PiSidebarSimpleThin />,
  },
];
