import { Outlet, ScrollRestoration } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/button";

const AuthLayout = () => {
  const navigate = useNavigate();

  return (
    <HelmetProvider>
      <header className="flex justify-center p-5 py-10">
        <div className="w-full max-w-[800px] inline-flex justify-between items-center border border-black/5 bg-white/90 backdrop-blur-md p-5 py-3 rounded-2xl shadow-sm">
          <Logo width="50px" />
           <Button variant="outline" onClick={() => navigate(-1)}>
             Go Back
           </Button>
        </div>
      </header>
      <section className="flex justify-center w-full">
        <div className="inline-flex w-full items-center px-5 py-24 xl:py-32 justify-center">
          <Outlet />
        </div>
      </section>
      <ScrollRestoration />
    </HelmetProvider>
  );
};

export default AuthLayout;
