import { FaUser, FaHeart } from "react-icons/fa";
import { BsFillDropletFill } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import adminService from "@/services/adminService";
import { Skeleton } from "@/components/ui/skeleton";
import QueryError from "@/components/shared/QueryError";
import PageTransition from "@/components/shared/PageTransition";
import StatCard from "@/components/shared/StatCard";

const AdminRoot = () => {
  const { authData } = useContext(AuthContext);

  const fetchData = async () => {
    const { data } = await adminService.getOverview();
    return data;
  };

  const { data: counts, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchData,
    enabled: !!authData,
  });

  if (isError) return <QueryError onRetry={refetch} />;

  const cards = [
    {
      to: "./all-users",
      count: counts?.totalDonors,
      title: "Total Donors",
      symbol: "+",
      icon: <FaUser />,
    },
    {
      to: "/fundings",
      count: counts?.totalFundingAmount || 0,
      title: "Total Funds",
      symbol: " BDT",
      icon: <FaHeart />,
    },
    {
      to: "./all-blood-donation-request",
      count: counts?.totalDonationRequests,
      title: "Total Donation Requests",
      symbol: "+",
      icon: <BsFillDropletFill />,
    },
  ];

  return (
    <>
      <PageTransition className="bg-white p-5 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {isLoading &&
            [...Array(3)].map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
            ))}
          {!isLoading &&
            cards.map((card) => (
              <StatCard
                key={card.title}
                to={card.to}
                title={card.title}
                value={card.count || 0}
                symbol={card.symbol}
                icon={card.icon}
                className="bg-red-500/10"
              />
            ))}
        </div>
      </PageTransition>
    </>
  );
};

export default AdminRoot;
