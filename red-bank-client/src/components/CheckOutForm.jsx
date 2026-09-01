import { useRef, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import LineError from "./ui/LineError";
import Input from "./ui/Input";
import { IoIosArrowRoundForward } from "react-icons/io";
import { motion } from "motion/react";
import { PiSpinnerGapThin } from "react-icons/pi";
import paymentService from "@/services/paymentService";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import { TfiClose } from "react-icons/tfi";
import PropTypes from "prop-types";
import { DONATION_AMOUNT_LIMITS } from "@/lib/constants";

const CheckOutForm = ({ setisOpenFund, refetch, titleId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMessage, setPaymentMessage] = useState("");
  const amountRef = useRef();
  const [note, setNote] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const navigate = useNavigate();

  const handleConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(amountRef.current.value) < DONATION_AMOUNT_LIMITS.MIN) {
      amountRef.current.focus();
      setPaymentMessage(
        `Minimum amount is ${DONATION_AMOUNT_LIMITS.MIN} BDT`
      );
      return;
    }

    if (!stripe || !elements) {
      setPaymentMessage("Stripe has not loaded yet.");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setPaymentMessage("Card element is not available.");
      return;
    }

    setIsFunding(true);
    setPaymentMessage("");

    try {
      const { data } = await paymentService.createPaymentIntent({
        amount: Number(amountRef.current.value),
        note,
      });
      const { clientSecret } = data;

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {},
        },
      });

      if (error) {
        cardElement.focus();
        setPaymentMessage(`Payment failed: ${error.message}`);
        return;
      }

      refetch();
      handleConfetti();
      setPaymentMessage(null);
      toast.success("Funding successfully added");
      setNote("");
      amountRef.current.value = "";
      setisOpenFund(false);
      navigate(`/fundings`);
    } catch (err) {
      console.error("Error during payment:", err);
      setPaymentMessage(err.message || "Error with the payment process.");
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <form
      data-aos="fade-up"
      className="bg-white h-fit p-8 w-full md:w-9/12 xl:w-5/12 space-y-4 rounded-xl border"
      onSubmit={handleSubmit}
    >
      <div className="w-full flex justify-end -mt-14">
        <button
           type="button"
           aria-label="Close funding form"
          className="translate-y-[23px] bg-black/10 p-2 rounded-b-md"
          onClick={() => setisOpenFund(false)}
        >
          <TfiClose />
        </button>
      </div>
      <h2 id={titleId} className="text-2xl font-semibold text-color-1">
        Support Red. Bank
      </h2>
      <div>
           <label htmlFor="fund-amount" className="block mb-1 font-semibold text-neutral-800 text-sm">
          Amount (BDT) *
        </label>
        <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
        <Input
          disabled={isFunding}
           ref={amountRef}
           id="fund-amount"
           type="number"
           min={DONATION_AMOUNT_LIMITS.MIN}
           max={DONATION_AMOUNT_LIMITS.MAX}
           step="0.01"
           placeholder="Ex - 500 BDT"
        />
      </div>
      <div>
         <label htmlFor="fund-note" className="block mb-1 font-semibold text-neutral-800 text-sm">
          Enter card information *
        </label>
        <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
        <div className="w-full border rounded-lg h-fit p-3">
          <CardElement
           disabled={isFunding}
           id="fund-note"
            options={{
              style: {
                base: {
                  fontFamily: '"Quicksand", sans-serif',
                },
              },
            }}
          />
        </div>
      </div>
      <div>
        <label className="block mb-1 font-semibold text-neutral-800 text-sm">
          Add a note
        </label>
        <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
        <textarea
          disabled={isFunding}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="p-2 border w-full rounded-lg text-sm placeholder:text-sm"
          rows={3}
          placeholder="Add a note"
        />
      </div>
      <div className="flex items-center gap-2">
        <input id="term" required type="checkbox" className="w-fit" />
        <label htmlFor="term" className="text-sm">
          Accept terms and conditions
        </label>
      </div>
      <div>
        <motion.button
          type="submit"
          disabled={!stripe || !elements || isFunding}
          className="bg-gradient-to-r hover:bg-red-800 flex items-center justify-center group gap-2 transition-all duration-500 animate-out hover:rounded-[50px] from-red-500 to-red-900/80 px-5 w-full text-white py-2 font-semibold rounded-[8px]"
        >
          {!isFunding ? (
            <>
              <span className="group-hover:hidden">Pay now</span>
              <IoIosArrowRoundForward
                size={24}
                className="hidden group-hover:block transition-all"
              />
            </>
          ) : (
            <>
              <PiSpinnerGapThin size={24} className="animate-spin" />
            </>
          )}
        </motion.button>
      </div>

      {paymentMessage && (
        <LineError error={paymentMessage} />
      )}
    </form>
  );
};

export default CheckOutForm;

CheckOutForm.propTypes = {
  setisOpenFund: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  titleId: PropTypes.string,
};
