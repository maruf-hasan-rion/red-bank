import NotFoundImgURI from "@/assets/404.webp";
import LineBrack from "@/components/ui/LineBrack";
import { Helmet } from "react-helmet-async";
import { IoIosReturnLeft } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const NotFound = ({ className }) => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 Page not found | Red. Bank</title>
      </Helmet>
      <div
        className={`w-full flex justify-center py-40 px-5 h-screen items-center ${className}`}
      >
        <div className="flex flex-col items-center">
          <img
            width={390}
            height={215}
            className="rotate-12"
            src={NotFoundImgURI}
            alt="404"
          />
          <div className="text-center space-y-5">
            <h2 className="text-4xl font-2 font-semibold">
              Oops! Page Not Found
            </h2>
            <p>
              We are really sorry, but the page you are looking for is not
              available. <LineBrack />
              Please use the navigation below to find your way back.
            </p>
          </div>
          <button onClick={() => navigate(-1)} className="flex pt-5 items-center gap-2 font-medium">
            Go back to prev
            <IoIosReturnLeft />
          </button>
        </div>
      </div>
    </>
  );
};

export default NotFound;

NotFound.propTypes = {
  className: PropTypes.string,
};
