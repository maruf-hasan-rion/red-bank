import BloodSelect from "@/components/ui/BloodSelect";
import Input from "@/components/ui/Input";
import { AuthContext } from "@/context/AuthContext";
import { useContext, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import donationService from "@/services/donationService";
import Swal from "sweetalert2";
import { PiSpinnerGapThin } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SelectDistrictAndUpazila from "@/components/ui/SelectDistrictAndUpazila";
import Button from "@/components/ui/button";
import { EMAIL_REGEX } from "@/lib/constants";

const CreateDonationReq = () => {
  const [bloodGroup, setBloodGroup] = useState();
  const { authData } = useContext(AuthContext);
  const [selectDistrictAndUpazila, setselectDistrictAndUpazila] = useState();

  const {
    register: formField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: (dataApi) => donationService.create(dataApi),
    onSuccess: (res) => {
      reset();
      setBloodGroup(null);
      setselectDistrictAndUpazila(null);
      navigate(`../donation/edit/${res.data?._id}`);
      Swal.fire({
        title: "Successfully created",
        text: "Donation request has been successfully created",
        icon: "success",
        confirmButtonText: "Close",
      });
    },
    onError: (err) => {
      Swal.fire({
        title: "Something went wrong",
        text: err?.response?.data?.message || "Please try again.",
        icon: "error",
        confirmButtonText: "Close",
      });
    },
  });
  const isCreating = createMutation.isPending;

  const CreateDonation = (data) => {
    if (!bloodGroup) {
      toast.error("Select a blood group");
      return;
    }
    if (!selectDistrictAndUpazila?.district) {
      toast.error("Select recipient district");
      return;
    }
    if (!selectDistrictAndUpazila?.upazila) {
      toast.error("Select recipient upazila");
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
      recipientDistrict: selectDistrictAndUpazila?.district?.value,
      recipientUpazila: selectDistrictAndUpazila?.upazila?.value,
      bloodGroup: bloodGroup,
    };
    createMutation.mutate(dataApi);
  };

  return (
    <>
      <Helmet>
        <title>Create Donation Request | Red. Bank</title>
      </Helmet>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create donation request</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <motion.form
        onSubmit={handleSubmit(CreateDonation)}
        initial={{ opacity: 0, translateY: 200 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="w-full flex justify-between gap-5 flex-col xl:flex-row"
      >
        <div
          className={`flex bg-white p-10 w-full rounded-xl flex-col gap-5 ${
            isCreating && "blur-sm"
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
                disabled={isCreating}
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
                disabled={isCreating}
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
                disabled={isCreating}
                {...formField("hospitalName", {
                  required: "Hospital name is required",
                })}
                label="Hospital"
                placeholder="Ex - Dhaka Medical College Hospital"
              />
              <Input
                disabled={isCreating}
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
                disabled={isCreating}
                {...formField("donationDate", {
                  required: "Donation date is required",
                })}
                type="date"
                label="Donation date"
              />
              <Input
                disabled={isCreating}
                {...formField("donationTime", {
                  required: "Donation time is required",
                })}
                type="time"
                label="Donation time"
              />
              <div className="w-full">
              <label className="block mb-1 font-semibold text-neutral-800">
                  Select blood group
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
            <SelectDistrictAndUpazila setData={setselectDistrictAndUpazila} />
          </div>
          <div className="w-full">
            <label className="block mb-1 font-semibold text-neutral-800">
              Request message
            </label>
            <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
            <textarea
               disabled={isCreating}
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
        <div className="md:w-[300px] bg-white p-6 rounded-xl h-fit">
          <label className="block mb-1 font-semibold text-neutral-800">
            Create donation request
          </label>
          <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
          <Button
            type="submit"
            disabled={isCreating}
            className={`w-full flex items-center gap-3 ${
              isCreating && "cursor-not-allowed opacity-70"
            }`}
          >
            {isCreating ? "Creating..." : "Create"}
            {isCreating && (
              <PiSpinnerGapThin size={20} className="animate-spin" />
            )}
          </Button>
        </div>
      </motion.form>
    </>
  );
};

export default CreateDonationReq;
