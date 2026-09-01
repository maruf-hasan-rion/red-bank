import Welcome from "@/components/ui/Welcome";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Helmet } from "react-helmet-async";
import DonorRoot from "./Donor/DonorRoot";
import VolunteerRoot from "./Volunteer/VolunteerRoot";
import AdminRoot from "./Admin/AdminRoot";

const Root = () => {
  const { authData } = useContext(AuthContext);

  return (
    <>
      <Helmet>
        <title>Dashboard | Red. Bank</title>
      </Helmet>
      <Welcome />
      {authData?.role === "donor" && <DonorRoot />}
      {authData?.role === "volunteer" && <VolunteerRoot />}
      {authData?.role === "admin" && <AdminRoot />}
    </>
  );
};

export default Root;