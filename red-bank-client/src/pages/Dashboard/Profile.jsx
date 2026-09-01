import { AuthContext } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useContext, useEffect, useState } from "react";
import BloodDrop from "@/assets/blooddrop.svg";
import { TbEdit } from "react-icons/tb";
import { motion } from "motion/react";
import Input from "@/components/ui/Input";
import { CiCamera } from "react-icons/ci";
import { AVATAR_COMPRESSION } from "@/lib/constants";
import Upload from "@/lib/upload";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { updateProfile } from "firebase/auth";
import { auth } from "@/firebase.config";
import authService from "@/services/authService";
import { useMutation, useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SelectDistrictAndUpazila from "@/components/ui/SelectDistrictAndUpazila";
import Button from "@/components/ui/button";
import BloodSelect from "@/components/ui/BloodSelect";
import FieldLabel from "@/components/shared/FieldLabel";

const Profile = () => {
  const { authData, setAuthData } = useContext(AuthContext);
  const [isEditing, setisEditing] = useState(false);
  const [updatedDisAndUp, setupdatedDisAndUp] = useState();
  const [bloodGroup, setBloodGroup] = useState();
  const [avatarUpdated, setavatarUpdated] = useState();

  const fetchProfileData = async () => {
    const { data } = await authService.getUser();
    return data;
  };

  const {
    data: profileData,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfileData,
    enabled: !!authData,
  });

  const updateMutation = useMutation({
    mutationFn: async (dataUpdate) => {
      await updateProfile(auth.currentUser, {
        displayName: dataUpdate.name,
        photoURL: dataUpdate.avatar,
      });
      await authService.updateUser(dataUpdate);
    },
    onSuccess: async () => {
      const refreshed = await refetch();
      if (refreshed.data) setAuthData(refreshed.data);
      setavatarUpdated(null);
      setisEditing(false);
      toast.success("Profile updated successfully");
    },
    onError: (error) =>
      toast.error(
        error?.response?.data?.message || "Failed to update profile"
      ),
  });
  const isProfileUpdating = updateMutation.isPending;

  useEffect(() => {
    if (!profileData) return;
    setAuthData(profileData);
    setupdatedDisAndUp({
      district: { value: profileData.district, label: profileData.district },
      upazila: { value: profileData.upazila, label: profileData.upazila },
    });
  }, [profileData, setAuthData]);

  useEffect(() => {
    setBloodGroup(authData?.bloodGroup);
  }, [authData?.bloodGroup]);

  const HandleAvatarUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (
        file &&
        file.type !== "image/webp" &&
        file.type !== "image/png" &&
        file.type !== "image/jpeg"
      ) {
        toast.error("Webp, Png, Jpeg format image");
        return;
      }

      const compressedAvatar = await imageCompression(file, AVATAR_COMPRESSION);
      const avatarUpdated = await Upload(compressedAvatar);
      setavatarUpdated(avatarUpdated?.secure_url);
    } catch {
      toast.error("Failed to upload avatar");
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();

    const form = e.target;
    const name = form.fullName.value;

    if (name?.length <= 0) {
      return toast.error("Please give a valid name");
    }
    if (!updatedDisAndUp?.upazila?.value) {
      toast.error("Choose an upazila");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update your profile",
      icon: "info",
      confirmButtonText: "Update",
      showCancelButton: true,
    }).then((res) => {
      if (res.isConfirmed) {
        const dataUpdate = {
          name: name,
          avatar: avatarUpdated || profileData?.avatar,
          bloodGroup: bloodGroup,
          district: updatedDisAndUp?.district.value,
          upazila: updatedDisAndUp?.upazila.value,
        };
        updateMutation.mutate(dataUpdate);
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>
          {isEditing ? "Edit Profile" : "Profile"} | Red. Bank
        </title>
      </Helmet>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link to="/dashboard">Dashboard</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{isEditing ? "Edit Profile" : "Profile"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <motion.div
        initial={{ translateY: 200, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        className="p-5 py-8 w-full rounded-xl bg-white"
      >
        {(isProfileUpdating || isLoading) && (
          <div className="flex items-center gap-10">
            <Skeleton className="w-20 h-20 rounded-full ml-8" />
            <div className="w-full space-y-5">
              <Skeleton className="w-40 h-6" />
              <Skeleton className="w-64 h-4" />
              <Skeleton className="w-56 h-4" />
            </div>
          </div>
        )}

        {!isEditing && !isLoading && !isProfileUpdating && (
          <>
            <div className="flex items-center gap-10">
              <div className="relative ml-8">
                <Avatar className="h-20 w-20 ring-4 ring-red-300 rounded-full transition-all">
                  <div
                    style={{
                      backgroundImage: `url('${
                        avatarUpdated || profileData?.avatar
                      }')`,
                    }}
                    className="w-20 h-20 bg-center bg-cover bg-no-repeat"
                  ></div>
                  <AvatarImage src={profileData?.avatar} className="hidden" />
                  <AvatarFallback>
                    {profileData?.name?.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -right-2 -top-1 z-10 flex">
                  <img width={35} src={BloodDrop} alt="Blood group" />
                  <span className="-translate-x-7 translate-y-3 text-sm text-white font-semibold">
                    {profileData?.bloodGroup}
                  </span>
                </span>
              </div>

              <div className="w-full justify-between flex border-b border-dashed pb-5">
                <h2 className="text-xl font-semibold">My profile</h2>
                <button onClick={() => setisEditing(true)} aria-label="Edit profile">
                  <TbEdit size={25} />
                </button>
              </div>
            </div>
            <div className="flex justify-between w-full items-center px-3 pt-10 gap-10 overflow-hidden">
              <div className="w-full flex justify-between gap-10 px-5 flex-wrap">
                <div className="space-y-10">
                  <div>
                    <label className="text-color-1/70">Full name</label>
                    <p className="font-semibold">{profileData?.name}</p>
                  </div>
                  <div>
                    <label className="text-color-1/70">District</label>
                    <p className="font-semibold">{profileData?.district}</p>
                  </div>
                </div>
                <div className="space-y-10">
                  <div>
                    <label className="text-color-1/70">Email</label>
                    <p className="font-semibold">{profileData?.email}</p>
                  </div>
                  <div>
                    <label className="text-color-1/70">Upazila</label>
                    <p className="font-semibold">{profileData?.upazila}</p>
                  </div>
                </div>
                <div>
                  <div>
                    <label className="text-color-1/70">Blood group</label>
                    <p className="font-semibold">{profileData?.bloodGroup}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {isEditing && !isLoading && (
          <>
            <Input
              onChange={HandleAvatarUpload}
              id="avatar"
              className="hidden"
              type="file"
            />
            <div className="flex items-center gap-10 justify-between">
              <label htmlFor="avatar" className="ml-8 cursor-pointer">
                <div
                  style={{
                    backgroundImage: `url('${
                      avatarUpdated || profileData?.avatar
                    }')`,
                  }}
                  className="w-20 hover:ring-8 transition-all bg-center bg-cover bg-no-repeat overflow-hidden flex justify-center items-center group h-20 rounded-full ring-4 ring-red-300"
                >
                  <div className="bg-black/50 hidden group-hover:flex justify-center items-center w-20 h-20">
                    <CiCamera size={30} className="text-white" />
                  </div>
                </div>
              </label>
              <div className="w-full justify-between flex border-b border-dashed pb-5">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <button
                 onClick={() => {
                   setisEditing(false);
                   setavatarUpdated(null);
                   setBloodGroup(profileData?.bloodGroup);
                   setupdatedDisAndUp({
                     district: { value: profileData?.district, label: profileData?.district },
                     upazila: { value: profileData?.upazila, label: profileData?.upazila },
                   });
                 }}
                 aria-label="Cancel editing profile"
                >
                  <TbEdit size={25} />
                </button>
              </div>
            </div>
            <form
              onSubmit={handleProfileUpdate}
              className="flex justify-between flex-col w-full items-center px-3 pt-10 gap-10 overflow-hidden pb-2"
            >
              <div className="w-full flex justify-between gap-5 px-5 flex-wrap min-[873px]:flex-nowrap">
                <div className="space-y-10 w-full">
                  <Input
                    name="fullName"
                    defaultValue={profileData?.name}
                    label="Full name"
                  />
                </div>
                <div className="space-y-10 w-full">
                  <Input
                    label="Email (Non-editable)"
                    defaultValue={profileData?.email}
                    disabled={true}
                  />
                </div>
                <div className="w-full">
                  <FieldLabel>Blood group</FieldLabel>
                  <BloodSelect
                    bloodGroup={bloodGroup}
                    setBloodGroup={setBloodGroup}
                  />
                </div>
              </div>
              <div className="w-full px-5 flex gap-5 flex-wrap min-[873px]:flex-nowrap">
                <SelectDistrictAndUpazila
                  setData={setupdatedDisAndUp}
                  defaultDistrict={profileData?.district}
                  defaultUpazila={profileData?.upazila}
                />
              </div>
              <div className="w-full flex justify-end">
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </>
  );
};

export default Profile;
