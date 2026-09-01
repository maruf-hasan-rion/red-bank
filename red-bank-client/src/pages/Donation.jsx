import { Skeleton } from "@/components/ui/skeleton";
import { AuthContext } from "@/context/AuthContext";
import donationService from "@/services/donationService";
import { useMutation, useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useContext } from "react";
import { CiCalendar, CiClock2, CiDroplet, CiLocationOn } from "react-icons/ci";
import { HiOutlineArrowLongLeft } from "react-icons/hi2";
import { useNavigate, useParams } from "react-router-dom";
import NotFound from "./NotFound";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import Button from "@/components/ui/button";
import { DONATION_STATUS, USER_ROLES } from "@/lib/constants";

const STATUS_STYLES = {
  [DONATION_STATUS.PENDING]: "bg-orange-500",
  [DONATION_STATUS.IN_PROGRESS]: "bg-yellow-500",
  [DONATION_STATUS.DONE]: "bg-sky-600",
  [DONATION_STATUS.CANCELED]: "bg-red-500",
};

const Donation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authData } = useContext(AuthContext);

  const {
    data: postDetails,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["donation", id],
    queryFn: async () => {
      const { data } = await donationService.getSingle(id);
      return data;
    },
    enabled: !!authData,
    retry: false,
  });

  const claimMutation = useMutation({
    mutationFn: () => donationService.claim(id),
    onSuccess: () => {
      toast.success("Blood donation requested successfully");
      refetch();
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  if (error) {
    return <NotFound />;
  }

  const isOwnRequest = postDetails?.authorEmail === authData?.email;

  const handleDonation = async () => {
    if (!authData) {
      toast.error("Please sign in to donate blood");
      return;
    }

    Swal.fire({
      title: "Confirm your donation",
      icon: "question",
      text: `Are you sure you want to donate blood to ${postDetails?.recipientName}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, I'll donate",
      cancelButtonText: "Not now",
    }).then((res) => {
      if (!res?.isConfirmed) {
        return;
      }
      claimMutation.mutate();
    });
  };

  const renderStatus = () => {
    if (postDetails?.status === DONATION_STATUS.PENDING) {
      if (isOwnRequest) {
        return (
          <p className="px-5 w-full sm:w-fit py-2 sm:ml-14 text-sm font-medium text-color-1/70 text-center">
            This is your request
          </p>
        );
      }
      if (authData?.role !== USER_ROLES.DONOR) {
        return (
          <p className="px-5 w-full sm:w-fit py-2 sm:ml-14 text-sm font-medium text-color-1/70 text-center">
            Donor accounts can respond to this request
          </p>
        );
      }
      return (
        <Button
          onClick={handleDonation}
          className="w-full sm:w-fit sm:ml-14"
          size="lg"
        >
          Donate
        </Button>
      );
    }
    return (
      <span
        className={`w-full sm:w-fit sm:ml-14 text-center px-5 py-2 text-white font-semibold rounded-lg ${
          STATUS_STYLES[postDetails?.status] || "bg-gray-400"
        }`}
      >
        {postDetails?.status === DONATION_STATUS.DONE
          ? "Done ✓"
          : postDetails?.status === DONATION_STATUS.CANCELED
          ? "Canceled ✕"
          : "In Progress"}
      </span>
    );
  };

  return (
    <>
      <Helmet>
        <title>
          Donation request for {postDetails?.recipientName || ""} | Red. Bank
        </title>
      </Helmet>
      <section className="flex justify-center w-full">
        <div className="max-w-site px-5 space-y-10 py-40 w-full">
          <div className="flex justify-start w-full">
             <button
               className="flex items-center gap-2 text-red-500 group transition-all"
               onClick={() => navigate(-1)}
            >
              <HiOutlineArrowLongLeft
                size={25}
                className="group-hover:-translate-x-3 transition-all"
              />
              Go back
             </button>
          </div>
          {!isLoading && (
            <div className="flex justify-between gap-10 flex-col-reverse xl:flex-row">
              <div className="w-full flex-col xl:w-full bg-white flex p-10 rounded-2xl border border-red-500/20">
                <div className="flex w-full flex-col sm:flex-row sm:justify-between sm:text-start">
                  <div className="flex gap-5 flex-col text-center items-center sm:text-start sm:flex-row">
                    <img
                      className="w-16 h-16 bg-cover ring-4 rounded-full ring-red-500/40"
                      src={
                        postDetails?.authorAvatar ||
                        "https://res.cloudinary.com/dogyg2j0h/image/upload/v1737446905/avatar-emoji-emoticon-emotion-expression-profile_zyzv4m.svg"
                      }
                      alt={postDetails?.authorName}
                    />
                    <div>
                      <h3 className="text-2xl font-semibold text-color-1">
                        {postDetails?.authorName}
                      </h3>
                      <p className="w-full overflow-hidden text-color-1/70">
                        {postDetails?.authorEmail}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 w-full flex items-center sm:items-end flex-col sm:w-fit text-end">
                    <h3 className="text-sm text-color-1/70">
                      {moment(postDetails?.createdAt).fromNow()} posted
                    </h3>
                    {renderStatus()}
                  </div>
                </div>
                <div className="pt-5 flex flex-wrap gap-5 w-full justify-center sm:justify-start">
                  <span className="flex items-center gap-2">
                    <CiCalendar size={20} className="text-red-500" />
                    {moment(postDetails?.donationDate).format("MMMM D, YYYY")}
                  </span>
                  <span className="font-thin text-color-1/70">|</span>
                  <span className="flex items-center gap-2">
                    <CiClock2 size={20} className="text-red-500" />
                    {moment(postDetails?.donationTime, "HH:mm").format("hh:mm A")}
                  </span>
                  <span className="font-thin text-color-1/70">|</span>
                  <span className="flex items-center gap-2">
                    <CiDroplet size={20} className="text-red-500" />
                    {postDetails?.bloodGroup}
                  </span>
                </div>
                <hr className="border-red-100 my-6 w-full" />
                <div>
                  <h3 className="text-lg font-semibold text-color-1">
                    Additional info
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-sm text-color-1/80">
                    <li className="flex items-start gap-2">
                      <CiLocationOn size={18} className="text-red-500 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-color-1">Location:</strong>{" "}
                        {postDetails?.recipientDistrict}
                        {postDetails?.recipientUpazila
                          ? `, ${postDetails?.recipientUpazila}`
                          : ""}
                      </span>
                    </li>
                    <li>
                      <strong className="text-color-1">Recipient:</strong>{" "}
                      {postDetails?.recipientName || "N/A"}
                    </li>
                    <li>
                      <strong className="text-color-1">Recipient email:</strong>{" "}
                      {postDetails?.recipientEmail || "N/A"}
                    </li>
                    <li>
                      <strong className="text-color-1">Hospital:</strong>{" "}
                      {postDetails?.hospitalName || "N/A"}
                    </li>
                    <li>
                      <strong className="text-color-1">Full address:</strong>{" "}
                      {postDetails?.fullAddress || "N/A"}
                    </li>
                  </ul>
                </div>
                <hr className="border-red-100 my-6 w-full" />
                <div>
                  <h3 className="text-lg font-semibold text-color-1">Message</h3>
                  <p className="mt-2 text-sm leading-relaxed text-color-1/80">
                    {postDetails?.donationMsg}
                  </p>
                </div>
              </div>
            </div>
          )}
          {isLoading && (
            <div className="flex justify-between gap-10 flex-col-reverse xl:flex-row">
              <div className="w-full flex-col xl:w-full bg-white flex p-10 rounded-2xl border border-red-500/20">
                <div className="flex w-full flex-col sm:flex-row sm:justify-between sm:text-start">
                  <div className="flex gap-5 flex-col text-center items-center sm:text-start sm:flex-row">
                    <div className="w-16 h-16 bg-cover ring-4 rounded-full ring-red-500/40">
                      <Skeleton className="w-full h-full rounded-full" />
                    </div>
                    <div>
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-40 mt-2" />
                    </div>
                  </div>
                  <div className="space-y-3 w-full flex items-center flex-col sm:w-fit text-end">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="px-5 w-full h-10 rounded-lg" />
                  </div>
                </div>
                <div className="pt-5 flex flex-wrap gap-5 w-full justify-center sm:justify-start">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <hr className="border-red-100 my-6 w-full" />
                <div>
                  <Skeleton className="h-5 w-36" />
                  <div className="mt-4 space-y-2.5">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-72" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-72" />
                  </div>
                </div>
                <hr className="border-red-100 my-6 w-full" />
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-9/12" />
                  <Skeleton className="h-4 w-11/12" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Donation;
