import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

export default function NumberTicker({
 value,
 direction = "up",
 delay = 0,
 className,
 decimalPlaces = 0,
}) {
 const ref = useRef(null);
 const motionValue = useMotionValue(direction === "down" ? value : 0);
 const springValue = useSpring(motionValue, {
 damping: 60,
 stiffness: 100,
 });
 const isInView = useInView(ref, { once: true, margin: "0px" });

 useEffect(() => {
 isInView &&
 setTimeout(() => {
 motionValue.set(direction === "down" ? 0 : value);
 }, delay * 1000);
 }, [motionValue, isInView, delay, value, direction]);

 useEffect(
 () =>
 springValue.on("change", (latest) => {
 if (ref.current) {
 ref.current.textContent = Intl.NumberFormat("en-US", {
 minimumFractionDigits: decimalPlaces,
 maximumFractionDigits: decimalPlaces,
 }).format(Number(latest.toFixed(decimalPlaces)));
 }
 }),
 [springValue, decimalPlaces]
 );

 return (
 <span
 className={cn(
 "inline-block tabular-nums tracking-wider text-black ",
 className
 )}
 ref={ref}
 />
 );
}

NumberTicker.propTypes = {
 value: PropTypes.number.isRequired,
 direction: PropTypes.oneOf(["up", "down"]),
 delay: PropTypes.number,
 className: PropTypes.string,
 decimalPlaces: PropTypes.number,
};
