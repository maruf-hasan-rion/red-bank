import BloodSelect from "@/components/ui/BloodSelect";
import Input from "@/components/ui/Input";
import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import donationService from "@/services/donationService";
import Swal from "sweetalert2";
import { PiSpinnerGapThin } from "react-icons/pi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import NotFound from "@/pages/NotFound";
import SelectDistrictAndUpazila from "@/components/ui/SelectDistrictAndUpazila";
import Button from "@/components/ui/button";
import { EMAIL_REGEX } from "@/lib/constants";

const UpdateDonationReq = () => {
  const [bloodGroup, setBloodGroup] = useState();
  const { authData } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [selectedDisAndUp, setselectedDisAndUp] = useState();

  const {
    register: formField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const updateMutation = useMutation({
    mutationFn: (dataApi) => donationService.update(id, dataApi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-donations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-donations"] });
      queryClient.invalidateQueries({ queryKey: ["donation-edit", id] });
      toast.success("Donation request updated successfully");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const UpdateDonation = (data) => {
    if (!bloodGroup) {
      toast.error("Select a blood group");
      return;
    }
    if (!selectedDisAndUp?.district?.value) {
      toast.error("Select a district");
      return;
    }
    if (!selectedDisAndUp?.upazila?.value) {
      toast.error("Select an upazila");
      return;
    }
    const {
      donationDate,
      donationMsg,
      donationTime,
      fullAddress,
      hospitalName,
      recEmail,
      recName,
    } = data;

    const dataApi = {
      donationDate,
      donationMsg,
      donationTime,
      fullAddress,
      hospitalName,
      recipientEmail: recEmail,
      recipientName: recName,
      recipientDistrict: selectedDisAndUp?.district?.value,
      recipientUpazila: selectedDisAndUp?.upazila?.value,
      bloodGroup: bloodGroup,
    };

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update this donation request?",
      icon: "question",
      confirmButtonText: "Update",
      showCancelButton: true,
      cancelButtonText: "Cancel",
    }).then((res) => {
      if (!res.isConfirmed) {
        return;
      }
      updateMutation.mutate(dataApi);
    });
  };

  const fetchDefaultData = async () => {
    const { data } = await donationService.getById(id);
    return data;
  };

  const { data: donationData, isLoading, error } = useQuery({
    queryKey: ["donation-edit", id],
    queryFn: fetchDefaultData,
    enabled: !!authData,
    retry: false,
  });

  useEffect(() => {
    if (!donationData) return;
    setBloodGroup(donationData.bloodGroup);
    setselectedDisAndUp({
      district: { value: donationData.recipientDistrict, label: donationData.recipientDistrict },
      upazila: { value: donationData.recipientUpazila, label: donationData.recipientUpazila },
    });
    reset({
      recEmail: donationData.recipientEmail,
      recName: donationData.recipientName,
      hospitalName: donationData.hospitalName,
      fullAddress: donationData.fullAddress,
      donationDate: moment(donationData.donationDate).format("YYYY-MM-DD"),
      donationTime: donationData.donationTime,
      donationMsg: donationData.donationMsg,
    });
  }, [donationData, reset]);

  const isUpdating = updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="w-full rounded-xl h-screen items-center flex justify-center">
        <PiSpinnerGapThin size={100} className="animate-spin text-red-500" />
      </div>
    );
  }

  if (error) {
    return <NotFound />;
  }

  return (
    <>
      <Helmet>
        <title>Update Donation Request | Red. Bank</title>
      </Helmet>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/dashboard">Dashboard</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link to="/dashboard/my-donation-request">Donation</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <motion.form
        onSubmit={handleSubmit(UpdateDonation)}
        initial={{ opacity: 0, translateY: 200 }}
        animate={{ opacity: 1, translateY: 0 }}
        className={`w-full flex justify-between gap-5 flex-col xl:flex-row`}
      >
        <div
          className={`flex bg-white p-10 w-full gap-5 rounded-xl flex-col ${
            isUpdating && "blur-md"
          }`}
        >
          <div className="w-full flex gap-5 flex-wrap sm:flex-nowrap">
            <Input
              disabled
              label="Requester name"
              defaultValue={authData?.name}
            />
            <Input
              disabled
              label="Requester email"
              defaultValue={authData?.email}
            />
          </div>
          <div className="w-full">
            <div className="w-full flex gap-5 flex-wrap sm:flex-nowrap">
              <Input
                {...formField("recName", {
                  required: "Recipient name is required",
                })}
                disabled={isUpdating}
                label="Recipient name"
                placeholder="Enter recipient name"
              />
              <Input
                {...formField("recEmail", {
                  required: "Recipient email is required",
                  pattern: {
                    value: EMAIL_REGEX,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                disabled={isUpdating}
                placeholder="Enter recipient email"
                label="Recipient email"
              />
            </div>
            {errors.recName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.recName.message}
              </p>
            )}
          </div>
          <div className="w-full">
            <div className="w-full flex gap-5 flex-wrap sm:flex-nowrap">
              <Input
                disabled={isUpdating}
                {...formField("hospitalName", {
                  required: "Hospital name is required",
                })}
                label="Hospital"
                placeholder="Ex - Dhaka Medical College Hospital"
              />
              <Input
                disabled={isUpdating}
                {...formField("fullAddress", {
                  required: "Full address is required",
                })}
                placeholder="Ex - Zahir Raihan Rd, Dhaka"
                label="Full address"
              />
            </div>
            {errors.hospitalName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.hospitalName.message}
              </p>
            )}
            {errors.fullAddress && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullAddress.message}
              </p>
            )}
          </div>
          <div className="w-full">
            <div className="w-full flex gap-5 flex-wrap sm:flex-nowrap">
              <Input
                disabled={isUpdating}
                {...formField("donationDate", {
                  required: "Donation date is required",
                })}
                type="date"
                label="Donation date"
              />
              <Input
                disabled={isUpdating}
                {...formField("donationTime", {
                  required: "Donation time is required",
                })}
                type="time"
                label="Donation time"
              />
              <div className="w-full">
              <label className="block mb-1 font-semibold text-neutral-800">
                  Blood group
                </label>
                <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
                <BloodSelect
                  setBloodGroup={setBloodGroup}
                  bloodGroup={bloodGroup}
                />
              </div>
            </div>
            {errors.donationDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.donationDate.message}
              </p>
            )}
            {errors.donationTime && (
              <p className="text-red-500 text-xs mt-1">
                {errors.donationTime.message}
              </p>
            )}
          </div>
          <div className="w-full flex gap-5 flex-wrap sm:flex-nowrap">
            {donationData && (
              <SelectDistrictAndUpazila
                defaultDistrict={donationData?.recipientDistrict}
                defaultUpazila={donationData?.recipientUpazila}
                setData={setselectedDisAndUp}
              />
            )}
          </div>
          <div className="w-full">
            <label className="block mb-1 font-semibold text-neutral-800">
              Request message
            </label>
            <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
            <textarea
               disabled={isUpdating}
               id="donation-message"
              rows={7}
              {...formField("donationMsg", {
                required: "Request message is required",
              })}
              className="border w-full px-5 py-2 rounded-lg ring-offset-1 focus:ring-1 ring-red-700/60 transition-all focus:border-transparent text-sm placeholder:text-color-1/80 placeholder:font-medium"
              placeholder="Type a message for potential donors"
            />
            {errors.donationMsg && (
              <p className="text-red-500 text-xs mt-1">
                {errors.donationMsg.message}
              </p>
            )}
          </div>
        </div>
        <div className="xl:w-[300px] bg-white p-6 rounded-xl h-fit">
          <label className="mb-1 font-semibold flex w-full justify-between text-neutral-800">
            Update
            <Link
              to={`/donation/${donationData?._id}`}
              className="underline text-red-500"
            >
              Preview
            </Link>
          </label>
          <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
          <Button
            type="submit"
            disabled={isUpdating}
            className={`w-full flex items-center gap-3 ${
              isUpdating && "cursor-not-allowed opacity-70"
            }`}
          >
            {isUpdating ? "Updating..." : "Update"}
            {isUpdating && (
              <PiSpinnerGapThin size={20} className="animate-spin" />
            )}
          </Button>
        </div>
      </motion.form>
    </>
  );
};

export default UpdateDonationReq;
