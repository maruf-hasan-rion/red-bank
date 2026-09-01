import moment from 'moment';
import { Link } from 'react-router-dom';
import Logo from './ui/Logo';
import LineBrack from './ui/LineBrack';
import { NAV_ITEMS } from '@/lib/navigation';
import { SOCIAL_LINKS } from '@/lib/socialLinks';
import { useMutation } from '@tanstack/react-query';
import frontendService from '@/services/frontendService';
import toast from 'react-hot-toast';

const Footer = () => {
  const subscribeMutation = useMutation({
    mutationFn: (email) => frontendService.subscribe(email),
    onSuccess: () => toast.success('Email successfully subscribed'),
    onError: (err) => {
      if (err.response?.data?.message === 'Email already subscribed') {
        toast.error('Email already subscribed');
      } else {
        toast.error('Something went wrong');
      }
    },
  });

  const bannerUrl = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/v1737400568/5ec74faaf972fa289eb5a6ab_banner-bg_nmnmsn.svg`;

  return (
    <>
      <section className="relative z-10 flex justify-center gap-5 px-5 translate-y-48">
        <div
          className="w-primary flex rounded-2xl bg-red-500 bg-cover bg-no-repeat p-10 text-white sm:p-14 md:p-20"
          style={{
            backgroundImage: `url('${bannerUrl}')`,
          }}
        >
          <div className="flex w-full flex-col gap-8 min-[1000px]:w-6/12">
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              Find your next <LineBrack />
              great opportunity!
            </h2>
            <p>
              Stay updated with the latest blood donation drives, success
              stories, and vital health tips. Join our community and be a hero
              today!
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                subscribeMutation.mutate(event.currentTarget.email.value);
                event.currentTarget.reset();
              }}
            >
              <div className="flex items-center justify-between rounded-lg bg-white px-2 py-2 text-black sm:flex-nowrap sm:pl-5">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="ex - example@gmail.com"
                  className="w-full py-1 placeholder:text-color-1"
                />
                <button className="w-full rounded-md bg-red-500 px-5 py-2 font-medium text-white sm:w-fit">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <footer className="flex justify-center rounded-t-[50px] bg-[#121229] text-white drop-shadow-[0_-7px_0px_#ff000085]">
        <div className="w-primary px-5 pt-64">
          <div className="flex w-full flex-wrap justify-between gap-10 md:flex-nowrap">
            <div className="flex w-full flex-col gap-5">
              <Logo className="text-white" textClass="font-semibold" />
              <p>
                Red Bank is dedicated to connecting donors with those in need of
                life-saving blood. Join us in making a difference.
              </p>
            </div>
            <div className="flex w-full flex-col gap-5">
              <h3 className="text-xl font-semibold">Quick Links</h3>
              <div className="flex flex-col space-y-3">
                {NAV_ITEMS.map((item) => (
                  <Link key={item.path} to={item.path}>
                    {item.pathName}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex w-full flex-col gap-5">
              <h3 className="text-xl font-semibold">Follow us</h3>
              <div className="flex flex-col space-y-3">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    className="flex items-center gap-5"
                    key={item.name}
                    href={item.path}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex w-full flex-col gap-5">
              <h3 className="text-xl font-semibold">Contact</h3>
              <address className="flex flex-col space-y-3 not-italic">
                <span>Level-4, 34, Awal Centre, Banani, Dhaka</span>
                <a href="mailto:web@programming-hero.com">web@programming-hero.com</a>
                <a href="tel:01322901105">01322901105, 01322810867</a>
                <span>Available: Sat - Thu, 10:00 AM to 7:00 PM</span>
              </address>
            </div>
          </div>
          <div className="my-3 mt-16 border-t border-white/30 text-center">
            <p className="py-5 font-medium">
              Copyright &copy; {moment().year()} <strong>Red. Bank</strong> All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
