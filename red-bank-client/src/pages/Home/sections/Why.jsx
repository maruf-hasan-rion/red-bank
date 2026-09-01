import WhyImgURI from "@/assets/why.svg";
import NumberTicker from "@/components/ui/number-ticker";
import frontendService from "@/services/frontendService";
import { useQuery } from "@tanstack/react-query";
import QueryError from "@/components/shared/QueryError";

const Why = () => {
  const fetchData = async () => {
    const { data } = await frontendService.getAllStatus();
    return data;
  };

  const { data, isError, refetch } = useQuery({
    queryKey: ["allStatus"],
    queryFn: fetchData,
  });

  if (isError) return <QueryError onRetry={refetch} />;

  const stats = [
    {
      value: data?.totalDonors || 0,
      label: "Total donors",
    },
    {
      value: data?.totalDonationReqDone || 0,
      label: "Blood donated",
    },
    {
      value: data?.totalFundingAmount || 0,
       label: "Funds raised (BDT)",
       prefix: "BDT ",
    },
  ];

  return (
    <>
      <section className="flex justify-center">
        <div className="w-primary inline-flex flex-col md:flex-row items-center gap-10 px-5">
          <div className="w-full md:w-6/12 flex justify-center">
            <img
              data-aos="fade-up"
              width={550}
              src={WhyImgURI}
              alt="Why Donate Blood"
            />
          </div>
          <div data-aos="fade-down" className="w-full md:w-6/12">
            <h3 className="text-4xl font-semibold text-color-1">
              Why Donate Blood?
            </h3>
            <span className="w-20 h-1 bg-red-500 flex my-5"></span>
            <p className="text-color-1/80">
              Blood donation is one of the simplest yet most impactful ways to
              save lives. A single donation can help save up to three lives,
              making you a hero in someone&apos;s eyes. The need for blood is
              constant — donations are required for surgeries, emergencies,
              cancer treatments, and countless other medical conditions.
            </p>
            <div className="flex flex-wrap gap-10 items-center pt-5">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <h3 className="text-3xl font-2 mt-2">
                    {stat.prefix || ""}
                    <NumberTicker value={stat.value} />
                    <span className="text-red-500">+</span>
                  </h3>
                  <p className="font-2 text-color-1/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Why;
