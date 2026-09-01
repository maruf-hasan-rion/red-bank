import Loader from "@/components/Loader";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const AdminRoutes = ({ volunteer, children }) => {
  const { authData, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <Loader />;
  }

  if (authData?.role === "admin" && authData?.status === "active") {
    return children;
  }
  if (
    volunteer &&
    authData?.role === "volunteer" &&
    authData?.status === "active"
  ) {
    return children;
  }

  return <Navigate to="/dashboard" />;
};

AdminRoutes.propTypes = {
  volunteer: PropTypes.bool,
  children: PropTypes.node,
};

export default AdminRoutes;
