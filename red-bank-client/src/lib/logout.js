import { auth } from '@/firebase.config';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import authService from '@/services/authService';

const Logout = () => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to log out of your account?',
    icon: 'question',
    confirmButtonText: 'Log out',
    showCancelButton: true,
    cancelButtonText: 'Cancel',
  }).then((res) => {
    if (res?.isConfirmed) {
      Promise.allSettled([signOut(auth), SilentLogout()]).then((results) => {
        if (results.some((result) => result.status === 'rejected')) {
          toast.error('Failed to log out. Please try again.');
          return;
        }
        toast.success('Logged out successfully');
      });
    }
  });
};

export const SilentLogout = async () => {
  const { data } = await authService.logout();
  return data;
};

export default Logout;
