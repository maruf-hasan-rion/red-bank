import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auth } from '@/firebase.config';
import firebaseErrorMessages from '@/firebase.errors';
import FormBox from '@/components/ui/FormBox';
import AuthTitleDes from '@/components/ui/AuthTitleDescription';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async ({ email }) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error(firebaseErrorMessages[error.code] || 'Unable to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormBox className="w-full max-w-[500px] space-y-5">
      <AuthTitleDes heading="Reset your password">
        Enter your account email and we will send you a reset link.
      </AuthTitleDes>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          disabled={isLoading}
          {...register('email', { required: true })}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
        <Link to="/auth/login" className="block text-center text-sm text-red-500 hover:underline">
          Back to login
        </Link>
      </form>
    </FormBox>
  );
};

export default ForgotPassword;
