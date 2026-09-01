import HeroBgURI from "@/assets/herobg.svg";
import Button from "@/components/ui/button";
import LineBrack from "@/components/ui/LineBrack";
import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { TfiClose } from "react-icons/tfi";
import { AnimatePresence, motion } from "motion/react";
import SelectDistrictAndUpazila from "@/components/ui/SelectDistrictAndUpazila";

const Hero = () => {
  const [isModalOpen, setisModalOpen] = useState(false);
  const [selectedDisAndUp, setselectedDisAndUp] = useState();
  const [bloodGroup, setBloodGroup] = useState();
  const naviagate = useNavigate();

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setisModalOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isModalOpen]);

  const SearchDonor = (e) => {
    e.preventDefault();

    if (
      !selectedDisAndUp?.district?.value ||
      !selectedDisAndUp?.upazila?.value ||
      !bloodGroup
    ) {
      toast.error("Select all fields");
      return;
    }

    const params = new URLSearchParams({
      district: selectedDisAndUp.district.value,
      upazila: selectedDisAndUp.upazila.value,
      bloodGroup,
    });

    naviagate(`/donor/search?${params.toString()}`);
  };

  return (
    <>
      <AnimatePresence>
        {isModalOpen && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="donor-search-dialog-title"
            className="flex justify-center fixed items-center w-full h-screen px-5 bg-black/30 z-[60]"
          >
            <motion.form
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              onSubmit={SearchDonor}
               className="bg-white/90 p-10 h-fit rounded-xl w-full md:w-[500px]"
            >
              <div className="flex justify-end -mt-7 translate-x-7">
                 <button
                  onClick={() => setisModalOpen(false)}
                  type="button"
                  aria-label="Close donor search"
                  className="bg-white/60 p-2 rounded-md"
                >
                  <TfiClose size={20} />
                </button>
              </div>
               <h2 id="donor-search-dialog-title" className="sr-only">
                 Search for blood donors
               </h2>
               <div className="w-full flex gap-2 flex-wrap sm:flex-nowrap">
                <SelectDistrictAndUpazila setData={setselectedDisAndUp} />
              </div>
              <div className="w-full pt-5">
                <label className="block mb-1 font-semibold text-neutral-800">
                  Blood group
                </label>
                <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
                <Select onValueChange={(e) => setBloodGroup(e)}>
                  <SelectTrigger className="w-full bg-white/40">
                    <SelectValue placeholder="Blood group" />
                  </SelectTrigger>
                  <SelectContent className="z-[60]">
                     <SelectItem value="A+">A+</SelectItem>
                     <SelectItem value="A-">A-</SelectItem>
                     <SelectItem value="B+">B+</SelectItem>
                     <SelectItem value="B-">B-</SelectItem>
                     <SelectItem value="AB+">AB+</SelectItem>
                     <SelectItem value="AB-">AB-</SelectItem>
                     <SelectItem value="O+">O+</SelectItem>
                     <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button className={`w-full mt-5 bg-red-500 text-white`}>
                  Search
                </Button>
              </div>
            </motion.form>
          </motion.section>
        )}
      </AnimatePresence>
      <section
        style={{ backgroundImage: `url('${HeroBgURI}')` }}
        className="flex bg-contain xl:bg-[length:1500px_700px] bg-bottom bg-no-repeat justify-center"
      >
        <div className="inline-flex text-center xl:pb-80 px-5 py-40 h-[700px] md:h-[1000px] flex-col items-center w-full bg-gradient-to-b from-transparent via-transparent to-[#f9f1ef]">
          <div
            data-aos="fade-up"
            className="pt-10 flex flex-col items-center gap-5 z-10"
          >
<div className="w-fit px-5 py-[2px] border bg-red-200/20 border-red-500/50 text-red-500 rounded-full">
                Every drop saves lives <span className="animate-pulse">❤️</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold text-color-1">
                Join the Lifesaving
                <LineBrack /> Mission with Red. Bank
              </h2>
              <p className="max-w-2xl text-color-1/80">
                Be a hero today. Red. Bank connects blood donors with those in
                need, making every <LineBrack /> drop of blood count. Join us in
                saving lives and building a stronger, healthier community.
              </p>
              <div className="flex justify-center gap-5 flex-wrap sm:flex-nowrap">
                <Link to={"/dashboard"}>
                  <Button size="lg">Join as a donor</Button>
                </Link>
                <Button
                  onClick={() => setisModalOpen(true)}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-3"
                >
                  Search Donors
                  <CiSearch size={20} />
                </Button>
              </div>
          </div>
          <div className="w-full h-80 p-40 blur-xl flex absolute bg-primary-1/80 z-0"></div>
        </div>
      </section>
    </>
  );
};

export default Hero;
