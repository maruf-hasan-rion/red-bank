import AuthTitleDes from "@/components/ui/AuthTitleDescription";
import FormBox from "@/components/ui/FormBox";
import Input from "@/components/ui/Input";
import LineError from "@/components/ui/LineError";
import Button from "@/components/ui/button";
import { auth } from "@/firebase.config";
import firebaseErrorMessages from "@/firebase.errors";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PiSpinnerGapLight } from "react-icons/pi";
import { Link } from "react-router-dom";
import { EMAIL_REGEX } from "@/lib/constants";

const Login = () => {
  const [isLoading, setisLoading] = useState(false);
  const {
    register: loginFields,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleLogin = async (data) => {
    setisLoading(true);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success("Login successful");
    } catch (err) {
      toast.error(firebaseErrorMessages[err?.code] || "Unable to log in");
    } finally {
      setisLoading(false);
    }
  };

  return (
    <>
      <FormBox className={`w-full max-w-[500px] space-y-5`}>
        <AuthTitleDes heading="Login | RedBank">
          Access your RedBank account to manage donations and stay connected
          with life-saving events.
        </AuthTitleDes>
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-3">
          <Input
            disabled={isLoading}
             autoComplete="email"
             {...loginFields("email", {
              required: "Email address is required",
              pattern: {
                value: EMAIL_REGEX,
                message: "Invalid email address",
              },
            })}
            label="Email Address"
            placeholder="Enter your email address"
          ></Input>
          {errors.email && <LineError error={errors.email.message} />}
          <Input
            disabled={isLoading}
             autoComplete="current-password"
             {...loginFields("password", {
              required: "Enter a strong password",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            label="Password"
            type="password"
            placeholder="Enter your account password"
          ></Input>
          {errors.password && <LineError error={errors.password?.message} />}
          <div className="flex justify-between items-center pt-2">
             <p className="text-sm text-neutral-600">Signed in on this device</p>
             <Link to="/auth/forgot-password" className="hover:underline">
              Forget password
            </Link>
          </div>
          <Button
            disabled={isLoading}
            type="submit"
            className="w-full flex gap-2 items-center justify-center"
          >
            Login
            {isLoading && (
              <PiSpinnerGapLight size={20} className="animate-spin" />
            )}
          </Button>
          <div className="pt-2 text-center">
            <p>
               Do not have an account{" "}
              <Link to={`/auth/register`} className="font-bold text-red-500">
                Register
              </Link>
            </p>
          </div>
        </form>
      </FormBox>
    </>
  );
};

export default Login;
