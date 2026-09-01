import PropTypes from "prop-types";

const AuthTitleDes = ({ heading, children }) => {
  return (
    <>
      <div className="w-full space-y-3">
        <h2 className="text-2xl font-semibold">{heading}</h2>
        <p className="text-[12.7px] text-neutral-600">{children}</p>
      </div>
    </>
  );
};

export default AuthTitleDes;

AuthTitleDes.propTypes = {
  heading: PropTypes.node.isRequired,
  children: PropTypes.node,
};
