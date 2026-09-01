import Loader from "@/components/Loader";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const PrivateRoutes = ({ children }) => {
  const { authData, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <Loader />;
  }

  if (authData) {
    return children;
  }

  return <Navigate to={"/auth/login"} />;
};

PrivateRoutes.propTypes = {
  children: PropTypes.node,
};

export default PrivateRoutes;
