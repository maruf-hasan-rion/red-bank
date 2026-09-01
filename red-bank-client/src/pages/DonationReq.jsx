import LineBrack from "@/components/ui/LineBrack";
import InjectImgURI from "@/assets/injecttion.webp";
import BloogBagURI from "@/assets/bloodbag.webp";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import frontendService from "@/services/frontendService";
import { useState } from "react";
import { CiCalendar, CiClock2, CiLocationOn } from "react-icons/ci";
import SearchImgURI from "@/assets/search.webp";
import moment from "moment";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { PiPrinterThin } from "react-icons/pi";
import Button from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import Pagination from "@/components/shared/Pagination";
import { Helmet } from "react-helmet-async";
import QueryError from "@/components/shared/QueryError";

const DonationReq = () => {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data: allDonationReq, isLoading, isError, refetch } = useQuery({
    queryKey: ["allDonationReq", limit, page],
    queryFn: async () => {
      const { data } = await frontendService.getPublicDonations(page, limit);
      return data;
    },
  });

  if (isError) return <QueryError onRetry={refetch} />;

  const handlePrint = () => {
    if (allDonationReq?.donations?.length < 1) {
      toast.error("No donation request to export");
      return;
    }

    window.print();
  };

  const totalItems = allDonationReq?.totalItems ?? 0;

  return (
    <>
      <Helmet>
        <title>Donation Requests | Red. Bank</title>
      </Helmet>
      <section className="flex justify-center py-10 pb-0 print:hidden">
        <div className="w-primary px-5 flex items-center text-center flex-col pb-10 pt-40 border-dashed border-b gap-8 border-b-red-500/20 mb-10">
          <div className="hidden xsm:flex w-full z-0 justify-between absolute max-w-[1220px]">
            <motion.img
              initial={{ opacity: 0, scale: 0.7, rotate: -45 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              width={200}
              src={BloogBagURI}
              alt="Blood bag"
            />
            <motion.img
              initial={{ opacity: 0, translateX: 50 }}
              whileInView={{ opacity: 1, translateX: 0 }}
              width={200}
              src={InjectImgURI}
              alt="Injection"
            />
          </div>
          <h2
            data-aos="fade-up"
            className="text-4xl md:text-5xl z-20 font-medium font-2 text-color-1"
          >
            Give the Gift of Life <LineBrack /> Donate{" "}
            <strong className="text-red-500">Blood</strong> Today
          </h2>
          <div className="w-full blur-2xl h-60 absolute bg-white/50 xl:w-5/12 z-10"></div>
          <p data-aos="fade-up" className="z-20 max-w-3xl text-color-1/80">
            Every donation can save up to three lives. Browse the open blood
            donation requests below and be the reason <LineBrack /> someone&apos;s
            family stays whole today.
          </p>
        </div>
      </section>
      <section className="flex justify-center print:hidden">
        <div className="w-primary px-5 flex justify-between items-center gap-3 -mt-5 pb-5">
          <div className="flex items-center gap-3">
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Showing 10 results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="30">30 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
            <span className="hidden sm:inline text-sm text-color-1/70">
              {totalItems > 0
                ? `${totalItems} request${totalItems > 1 ? "s" : ""} open`
                : ""}
            </span>
          </div>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2"
          >
            <PiPrinterThin size={18} />
            Print
          </Button>
        </div>
      </section>
      <section id="exportToPDF" className="flex justify-center print:hidden">
        <div className="w-primary px-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5">
          {!isLoading &&
            allDonationReq?.donations?.length > 0 &&
            allDonationReq?.donations?.map((donation) => (
              <div
                key={donation._id}
                className="bg-white rounded-2xl border border-red-500/10 p-5 flex flex-col gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-color-1 leading-snug">
                    {donation?.recipientName}
                  </h3>
                  <span className="shrink-0 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {donation?.bloodGroup}
                  </span>
                </div>
                <span className="h-px w-full bg-red-100" />
                <ul className="space-y-2.5 text-sm text-color-1/80">
                  <li className="flex items-start gap-2">
                    <CiLocationOn
                      size={18}
                      className="text-red-500 shrink-0 mt-0.5"
                    />
                    <span>{donation?.fullAddress}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CiCalendar size={18} className="text-red-500" />
                    <span>
                      {moment(donation?.donationDate).format("MMMM D, YYYY")}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CiClock2 size={18} className="text-red-500" />
                    <span>
                      {moment(donation?.donationTime, "HH:mm").format("hh:mm A")}
                    </span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="mt-auto w-full">
                  <Link to={`/donation/${donation?._id}`}>View Details</Link>
                </Button>
              </div>
            ))}
          {isLoading &&
            [...Array(limit)].map((_, index) => (
              <div
                key={`loader-${index + 1}`}
                className="bg-white rounded-2xl border border-red-500/10 p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          {!isLoading && allDonationReq?.donations?.length <= 0 && (
            <div className="col-span-full flex justify-center py-10">
              <EmptyState
                icon={
                  <img
                    src={SearchImgURI}
                    width={220}
                    height={220}
                    alt="No donation requests"
                  />
                }
                title="No open donation requests right now"
                description="There are currently no open requests to display. Please check back soon — or consider becoming a donor so you&apos;re ready when someone needs you."
              />
            </div>
          )}
        </div>
      </section>
      <section className="flex justify-center py-10 print:hidden">
        <div className="w-primary px-5">
          {!isLoading && (
            <Pagination
              currentPage={page}
              totalPages={allDonationReq?.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </section>
      <section className="hidden print:block">
        <div className="w-full px-10 py-8">
          <div className="flex items-end justify-between border-b-2 border-red-500 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-red-500">Red. Bank</h1>
              <p className="text-sm text-gray-600">
                Open Blood Donation Requests
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Printed on {moment().format("MMMM D, YYYY")}
            </p>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-red-100 text-left">
                <th className="border border-red-200 px-3 py-2 font-semibold">
                  Recipient
                </th>
                <th className="border border-red-200 px-3 py-2 font-semibold">
                  Blood group
                </th>
                <th className="border border-red-200 px-3 py-2 font-semibold">
                  Location
                </th>
                <th className="border border-red-200 px-3 py-2 font-semibold">
                  Date
                </th>
                <th className="border border-red-200 px-3 py-2 font-semibold">
                  Time
                </th>
                <th className="border border-red-200 px-3 py-2 font-semibold">
                  Message
                </th>
              </tr>
            </thead>
            <tbody>
              {!isLoading &&
                allDonationReq?.donations?.map((donation) => (
                  <tr key={donation?._id}>
                    <td className="border border-red-200 px-3 py-2">
                      {donation?.recipientName}
                    </td>
                    <td className="border border-red-200 px-3 py-2 font-semibold">
                      {donation?.bloodGroup}
                    </td>
                    <td className="border border-red-200 px-3 py-2">
                      {donation?.fullAddress}
                    </td>
                    <td className="border border-red-200 px-3 py-2">
                      {moment(donation?.donationDate).format("MMMM D, YYYY")}
                    </td>
                    <td className="border border-red-200 px-3 py-2">
                      {moment(donation?.donationTime, "HH:mm").format("hh:mm A")}
                    </td>
                    <td className="border border-red-200 px-3 py-2">
                      {donation?.donationMsg}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default DonationReq;
