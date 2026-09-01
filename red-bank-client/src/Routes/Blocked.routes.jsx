import Loader from "@/components/Loader";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import PropTypes from "prop-types";
import Blocked from "../components/Blocked";

const BlockedRoute = ({ children }) => {
  const { authData, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <Loader />;
  }

  if (authData?.status === "active") {
    return children;
  }

  return <Blocked />;
};

BlockedRoute.propTypes = {
  children: PropTypes.node,
};

export default BlockedRoute;
