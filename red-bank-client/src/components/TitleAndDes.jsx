import PropTypes from "prop-types";

const TitleAndDes = ({ title, children }) => {
  return (
    <>
      <section data-aos="fade-up" className="flex justify-center pt-40">
        <div className="w-primary px-5 justify-center text-center flex flex-col items-center">
          <h3 className="text-4xl font-semibold">{title}</h3>
          <span className="w-20 h-1 bg-red-500 flex my-3"></span>
          <p>{children}</p>
        </div>
      </section>
    </>
  );
};

export default TitleAndDes;

TitleAndDes.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node,
};
