import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import donationService from "@/services/donationService";
import { Skeleton } from "@/components/ui/skeleton";
import { GoPlus } from "react-icons/go";
import { CiSearch, CiUser } from "react-icons/ci";
import { SlList } from "react-icons/sl";
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import QueryError from "@/components/shared/QueryError";
import PageTransition from "@/components/shared/PageTransition";
import StatCard from "@/components/shared/StatCard";
import QuickActionCard from "@/components/shared/QuickActionCard";
import { DONATION_STATUS } from "@/lib/constants";

const DonorRoot = () => {
  const { authData } = useContext(AuthContext);

  const { data: myRequests, isLoading, isError, refetch } = useQuery({
    queryKey: ["donorMyRequests", authData?.email],
    queryFn: async () => {
      const { data } = await donationService.getForDonor(authData?.email);
      return data || [];
    },
    enabled: !!authData,
  });

  const { data: joinedData, isError: joinedError, refetch: refetchJoined } = useQuery({
    queryKey: ["donorJoinedCount", authData?.email],
    queryFn: async () => {
      const { data } = await donationService.getDonationsIJoined(
        authData?.email,
        1,
        1
      );
      return data;
    },
    enabled: !!authData,
  });

  if (isError || joinedError) {
    return <QueryError onRetry={isError ? refetch : refetchJoined} />;
  }

  const stats = [
    {
      to: "/dashboard/my-donation-request",
      title: "My Requests",
      value: myRequests?.length || 0,
    },
    {
      to: "/dashboard/my-donation-request",
      title: "Donations Completed",
      value:
        myRequests?.filter((d) => d?.status === DONATION_STATUS.DONE).length ||
        0,
    },
    {
      to: "/dashboard/my-donation-request",
      title: "Requests I'm Donating To",
      value: joinedData?.totalItems || 0,
    },
  ];

  const quickActions = [
    {
      to: "/dashboard/create-donation-request",
      title: "Create Donation Request",
      description: "Post a request to get blood for someone in need",
      icon: <GoPlus size={55} className="text-red-500" />,
    },
    {
      to: "/donor/search",
      title: "Search Donors",
      description: "Find matching donors by blood group and location",
      icon: <CiSearch size={55} className="text-red-500" />,
    },
    {
      to: "/dashboard/my-donation-request",
      title: "My Donation Requests",
      description: "Track, edit, and manage your requests",
      icon: <SlList size={55} className="text-red-500" />,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {isLoading &&
          [...Array(3)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          ))}
        {!isLoading &&
          stats.map((stat) => (
            <StatCard
              key={stat.title}
              to={stat.to}
              title={stat.title}
              value={stat.value}
              icon={<HiOutlineDotsCircleHorizontal />}
            />
          ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {quickActions.map((action) => (
          <QuickActionCard key={action.title} {...action} />
        ))}
      </div>
    </PageTransition>
  );
};

export default DonorRoot;
