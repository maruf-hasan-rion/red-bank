import CheckOutForm from "@/components/CheckOutForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PropTypes from "prop-types";
import { useEffect } from "react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const GiveFund = ({ setisOpenFund, refetch }) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setisOpenFund(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [setisOpenFund]);

return (
    <>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="fund-dialog-title"
        className="flex justify-center w-full fixed h-screen bg-black/30 z-[60]"
      >
        <div className="inline-flex items-center w-primary overflow-y-scroll py-80 [&::-webkit-scrollbar]:w-0 justify-center px-5">
          <Elements stripe={stripePromise}>
            <CheckOutForm
              refetch={refetch}
              setisOpenFund={setisOpenFund}
              titleId="fund-dialog-title"
            />
          </Elements>
        </div>
      </section>
    </>
  );
};

export default GiveFund;

GiveFund.propTypes = {
  setisOpenFund: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};
