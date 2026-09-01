import Hero from "./sections/Hero";
import Why from "./sections/Why";
import How from "./sections/How";
import { Helmet } from "react-helmet-async";
import Review from "./sections/Review";
import ContactUs from "./sections/ContactUs";
import Blog from "./sections/Blog";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Red. Bank — Blood Donation Platform</title>
        <meta
          name="description"
          content="Red. Bank connects blood donors with those in need. Browse open donation requests, find donors, and save lives."
        />
      </Helmet>
      <Hero />
      <Why />
      <How />
      <Review />
      <ContactUs />
      <Blog />
    </>
  );
};

export default Home;