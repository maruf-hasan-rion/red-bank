import { AuthContext } from "@/context/AuthContext";
import { motion } from "motion/react";
import { useContext } from "react";
import { USER_ROLES } from "@/lib/constants";

const Welcome = () => {
  const { authData } = useContext(AuthContext);

  return (
    <>
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        className="bg-brand-500/10 border-l-[6px] border-l-brand-600/70 border border-brand-500/20 rounded-xl px-5 py-5 space-y-3"
      >
        <h2 className="text-2xl font-semibold">
          Welcome{" "}
          <span className="text-brand-500">
            {authData?.role === USER_ROLES.ADMIN ? "Admin" : authData?.name}
          </span>{" "}
          to Red. Bank 🎉
        </h2>
        <p className="text-color-1/70">
          {authData?.role === USER_ROLES.DONOR
            ? "Track your requests, find donors, and keep saving lives."
            : "Manage donors, requests, and platform content from here."}
        </p>
      </motion.div>
    </>
  );
};

export default Welcome;