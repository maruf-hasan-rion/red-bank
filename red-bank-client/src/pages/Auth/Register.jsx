import AuthTitleDes from "@/components/ui/AuthTitleDescription";
import FormBox from "@/components/ui/FormBox";
import Input from "@/components/ui/Input";
import LineError from "@/components/ui/LineError";
import { useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { PiSpinnerGapLight, PiUserCircleLight } from "react-icons/pi";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import Upload from "@/lib/upload";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/firebase.config";
import authService from "@/services/authService";
import firebaseErrorMessages from "@/firebase.errors";
import { Link } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import SelectDistrictAndUpazila from "@/components/ui/SelectDistrictAndUpazila";
import BloodSelect from "@/components/ui/BloodSelect";
import FieldLabel from "@/components/shared/FieldLabel";
import Button from "@/components/ui/button";
import { AVATAR_COMPRESSION, EMAIL_REGEX } from "@/lib/constants";

const Register = () => {
  const [selectedDisAndUp, setselectedDisAndUp] = useState();
  const [bloodGroup, setBloodGroup] = useState();
  const [avatar, setavatar] = useState();
  const avatarRef = useRef();
  const [avatarError, setavatarError] = useState();
  const [bloodGroupError, setBloodGroupError] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const { setAuthData, setIsProvisioning } = useContext(AuthContext);
  const {
    register: registerField,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
    watch,
  } = useForm();

  const handleRegister = async (data) => {
    if (!selectedDisAndUp?.district?.value) {
      toast.error("Select a district");
      return;
    }
    if (!selectedDisAndUp?.upazila?.value) {
      toast.error("Select a upazila");
      return;
    }
    if (!avatar || avatar === "uploading") {
      setavatarError("Upload a avatar");
      setError("avatar", {
        type: "manual",
        message: "",
      });
      return;
    }
    if (!bloodGroup) {
      setBloodGroupError(true);
      return;
    }
    setisLoading(true);
    setIsProvisioning(true);

    let firebaseUser;
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      firebaseUser = credential.user;

      await updateProfile(firebaseUser, {
        displayName: data.name,
        photoURL: avatar,
      });

      const response = await authService.createUser({
        name: data.name,
        avatar,
        bloodGroup,
        district: selectedDisAndUp.district.value,
        upazila: selectedDisAndUp.upazila.value,
      });

      setAuthData(response.data);
      toast.success("Registration successful");
    } catch (error) {
      if (firebaseUser) {
        await deleteUser(firebaseUser).catch(() => signOut(auth));
      }
      toast.error(
        firebaseErrorMessages[error?.code] ||
          error?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setIsProvisioning(false);
      setisLoading(false);
    }
  };

  const password = watch("password");

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      file &&
      file.type !== "image/webp" &&
      file.type !== "image/png" &&
      file.type !== "image/jpeg"
    ) {
      toast.error("Webp, Png, Jpeg format image");
      avatarRef.current.value = "";
      return;
    }
    setavatar("uploading");

    try {
      const filCompressed = await imageCompression(file, AVATAR_COMPRESSION);
      const uploadedAvatar = await Upload(filCompressed);
      clearErrors("avatar");
      setavatar(uploadedAvatar.secure_url);
      setavatarError(false);
    } catch (error) {
      setavatar(undefined);
      setavatarError("Failed to upload avatar");
      toast.error(error.message || "Failed to upload avatar");
    }
  };

  return (
    <>
      <FormBox className={`w-full max-w-[650px] space-y-5`}>
        <AuthTitleDes heading={`Register to Save Lives `}>
          Register today and become a part of our mission to provide lifesaving
          blood <br />
          to those who need it the most.
        </AuthTitleDes>
        <form onSubmit={handleSubmit(handleRegister)} className="space-y-5">
          <div className="flex justify-between gap-5 flex-wrap md:flex-nowrap">
            <Input
              label="Full name"
              {...registerField("name", {
                required: "Full name is required",
              })}
              placeholder="Enter your full name"
              errorMessage={errors.name?.message}
            >
              {errors.name && <LineError error={errors.name?.message} />}
            </Input>
            <Input
              label="Email Address"
              {...registerField("email", {
                required: "Email address is required",
                pattern: {
                  value: EMAIL_REGEX,
                  message: "Invalid email address",
                },
              })}
              placeholder="Email Address"
              errorMessage={errors.email?.message}
            >
              {errors.email && <LineError error={errors.email?.message} />}
            </Input>
          </div>
          <div className="flex justify-between gap-5 flex-wrap md:flex-nowrap">
            <Input
              label="Password"
              {...registerField("password", {
                required: "Enter a strong password",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                validate: (value) => {
                  if (!/[A-Z]/.test(value)) {
                    return "Password must contain at least one uppercase letter";
                  }
                  if (!/[a-z]/.test(value)) {
                    return "Password must contain at least one lowercase letter";
                  }
                  return true;
                },
              })}
              type="password"
              placeholder="Enter a strong password"
              errorMessage={errors.password?.message}
            >
              {errors.password && (
                <LineError error={errors.password?.message} />
              )}
            </Input>

            <Input
              type="password"
              label="Confirm Password"
              {...registerField("confirmpassword", {
                required: "Confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              placeholder="Confirm your password"
              errorMessage={errors.confirmpassword?.message}
            >
              {errors.confirmpassword && (
                <LineError error={errors.confirmpassword?.message} />
              )}
            </Input>
          </div>
          <div className="flex justify-between gap-5 flex-wrap md:flex-nowrap">
            <SelectDistrictAndUpazila setData={setselectedDisAndUp} />
          </div>
          <div className="flex justify-between gap-5 flex-wrap md:flex-nowrap">
            <div className="w-full">
              <FieldLabel>Select Blood group</FieldLabel>
              <BloodSelect
                bloodGroup={bloodGroup}
                setBloodGroup={(bg) => {
                  setBloodGroup(bg);
                  setBloodGroupError(false);
                  clearErrors("bloodGroup");
                }}
              />
              {bloodGroupError && (
                <LineError error="Select a blood group" />
              )}
            </div>
            <div className="w-full">
              <div>
                <label className="block mb-1 font-semibold text-neutral-800">
                  Upload your avatar
                </label>
                <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
              </div>
              <Input
                onChange={handleAvatarUpload}
                ref={avatarRef}
                accept=".webp, .png, .jpg, .jpeg"
                id="avatarU"
                type="file"
                className="hidden"
              />
              <label htmlFor="avatarU">
                <div className="w-full border rounded-xl p-3 cursor-pointer flex gap-4">
                     {avatar === "uploading" ? (
                    <PiSpinnerGapLight
                      color="red"
                      className="animate-spin"
                      size={40}
                    />
                  ) : avatar === undefined ? (
                    <PiUserCircleLight color="red" size={40} />
                  ) : (
                    <img
                      className="rounded-full object-cover w-10 ring-2 scale-90 h-10 ring-red-500 ring-offset-2"
                      src={avatar}
                    />
                  )}
                  <div>
                    <h5 className="text-[16px] font-medium">Avatar</h5>
                    <p className="text-xs">
                       {avatar === "uploading"
                        ? "Uploading..."
                        : avatar === undefined
                        ? "Upload"
                        : "Upload Succes"}
                    </p>
                  </div>
                </div>
              </label>
              {avatarError && <LineError error={avatarError} />}
            </div>
          </div>
          <Button
            disabled={isLoading}
            type="submit"
            className="w-full flex gap-2 items-center justify-center"
          >
            Register
            {isLoading && (
              <PiSpinnerGapLight size={20} className="animate-spin" />
            )}
          </Button>
          <div className="pt-2 text-center">
            <p>
              Already have an account{" "}
              <Link to={`/auth/login`} className="font-bold text-red-500">
                Login
              </Link>
            </p>
          </div>
        </form>
      </FormBox>
    </>
  );
};

export default Register;
