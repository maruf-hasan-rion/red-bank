import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

const Layout = () => {
  return (
    <HelmetProvider>
      <Header />
      <Outlet />
      <Footer />
      <ScrollRestoration />
    </HelmetProvider>
  );
};

export default Layout;
