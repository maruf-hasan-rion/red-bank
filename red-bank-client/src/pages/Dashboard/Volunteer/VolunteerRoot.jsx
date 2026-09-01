import { GoPlus } from "react-icons/go";
import { CiUser } from "react-icons/ci";
import { PiDropThin, PiSidebarSimpleThin } from "react-icons/pi";
import { IoInformation } from "react-icons/io5";
import PageTransition from "@/components/shared/PageTransition";
import QuickActionCard from "@/components/shared/QuickActionCard";

const VolunteerRoot = () => {
  const quickActions = [
    {
      to: "/dashboard/all-blood-donation-request",
      title: "All Donation Requests",
      description: "Review and update the status of every request",
      icon: <PiDropThin size={55} className="text-red-500" />,
    },
    {
      to: "/dashboard/content-management",
      title: "Content Management",
      description: "Create and edit awareness posts and stories",
      icon: <PiSidebarSimpleThin size={55} className="text-red-500" />,
    },
    {
      to: "/dashboard/create-donation-request",
      title: "Create Donation Request",
      description: "Help someone post a request for blood",
      icon: <GoPlus size={55} className="text-red-500" />,
    },
    {
      to: "/dashboard/profile",
      title: "Profile",
      description: "Update your details and blood group",
      icon: <CiUser size={55} className="text-red-500" />,
    },
  ];

  return (
    <PageTransition className="w-full space-y-5">
      <div className="w-full px-5 py-4 border border-orange-500 gap-2 rounded-xl flex-wrap items-center text-orange-700 font-medium bg-orange-100 flex">
        <IoInformation size={30} />
        <span>
          As a volunteer, you coordinate donation requests and manage platform
          content. Every update you make helps save lives.
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {quickActions.map((action) => (
          <QuickActionCard key={action.title} {...action} />
        ))}
      </div>
    </PageTransition>
  );
};

export default VolunteerRoot;