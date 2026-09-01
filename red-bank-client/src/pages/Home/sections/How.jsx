import TitleAndDes from "@/components/TitleAndDes";
import LineBrack from "@/components/ui/LineBrack";
import { BsInputCursor } from "react-icons/bs";
import { CiWifiOn } from "react-icons/ci";
import { GoPlus } from "react-icons/go";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoInformationSharp } from "react-icons/io5";

const How = () => {
  return (
    <>
      <TitleAndDes title={`How It Works`}>
        At Red. Bank, we simplify blood donation with an easy-to-use platform
        and dedicated support, ensuring a
        <LineBrack /> smooth, convenient journey — from finding a donor to
        making a donation that saves lives.
      </TitleAndDes>
      <section className="flex justify-center">
        <div className="w-primary grid px-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 justify-between gap-5 pb-20 pt-10">
          {StackCardData &&
            StackCardData.map((card, index) => (
              <div
                data-aos="fade-up"
                data-aos-delay={index * 200}
                data-aos-anchor-placement="bottom-bottom"
                key={index}
                className="p-5 bg-white w-full transition-all col-span-1 hover:border-red-400 cursor-pointer border rounded-xl space-y-5"
              >
                <div className="flex gap-3 items-center">
                  <span className="p-2 border text-xl text-red-500 bg-red-50 rounded-md">
                    {card?.icon}
                  </span>
                </div>
                <h2 className="font-2">{card.title}</h2>
                <p className="text-xs">{card?.description}</p>
              </div>
            ))}
        </div>
      </section>
    </>
  );
};

export default How;

const StackCardData = [
  {
    title: "Create an Account",
    description:
      "Sign up quickly to access all features, schedule donations, and find donors.",
    icon: <BsInputCursor />,
  },
  {
    title: "Request Blood or Find a Donor",
    description:
      "Post a blood donation request or search for a matching donor in minutes.",
    icon: <GoPlus />,
  },
  {
    title: "Connect With Your Donor",
    description:
      "Reach donors or donation centers securely through the platform.",
    icon: <CiWifiOn />,
  },
  {
    title: "Donate & Save Lives",
    description:
      "Meet your donor or visit a center to complete a safe, comfortable donation.",
    icon: <IoMdHeartEmpty />,
  },
  {
    title: "Track Your Impact",
    description:
      "Stay motivated by seeing the lives your donations continue to touch.",
    icon: <IoInformationSharp />,
  },
];
