import { PiPhoneCallLight } from "react-icons/pi";
import { Link } from "react-router-dom";
import { HiOutlineEnvelope } from "react-icons/hi2";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/button";
import frontendService from "@/services/frontendService";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

const ContactUs = () => {
  const contactMutation = useMutation({
    mutationFn: (payload) => frontendService.sendContactMessage(payload),
    onSuccess: () => toast.success("Message sent successfully"),
    onError: (err) =>
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      ),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const payload = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      company: form.company.value,
      message: form.message.value,
    };

    contactMutation.mutate(payload, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <>
      <section
        id="contact"
        className="flex justify-center md:mt-40 overflow-x-hidden"
      >
        <div className="w-full flex justify-center flex-col items-center">
          <div className="flex w-full px-5 flex-col xl:flex-row max-w-site justify-between gap-10 -mb-80 xl:-mb-60 z-10">
            <div className="flex flex-col w-full xl:w-6/12 gap-7 pt-5">
              <div className="space-y-5" data-aos="fade-down">
                <h3 className="text-5xl font-semibold">
                  <strong className="text-white bg-red-500 px-2 rounded-md">
                    Contact
                  </strong>{" "}
                  Us
                </h3>
                <p className="text-color-1/80">
                  We&apos;re here to help! Whether you have questions about
                  donating blood, organizing a drive, or anything else, feel
                  free to reach out.
                </p>
              </div>
              <div
                data-aos="fade-up"
                data-aos-delay={1 * 200}
                className="border bg-white rounded-xl p-5 flex-col flex md:flex-row gap-5"
              >
                <PiPhoneCallLight
                  size={50}
                  className="bg-primary-1 p-2 rounded-xl text-red-500"
                />
                <div>
                  <h2 className="text-xl font-semibold">Talk with us</h2>
                  <p className="text-color-1/80">
                    Our lines are open from 9 AM to 5 PM, Monday through Friday.
                  </p>
                  <Link
                    to={`tel:(123) 456-7890`}
                    className="text-red-500 font-semibold pt-2 flex hover:underline"
                  >
                    (123) 456-7890
                  </Link>
                </div>
              </div>
              <div
                data-aos="fade-up"
                data-aos-delay={2 * 200}
                className="border bg-white rounded-xl p-5 flex-col flex md:flex-row gap-5"
              >
                <HiOutlineEnvelope
                  size={50}
                  className="bg-primary-1 p-2 rounded-xl text-red-500"
                />
                <div>
                  <h2 className="text-xl font-semibold">Send us an email</h2>
                  <p className="text-color-1/80">
                    Send us an email and we&apos;ll get back to you within 24
                    hours.
                  </p>
                  <Link
                    to={`mailto:support@blooddonation.org`}
                    className="text-red-500 font-semibold pt-2 flex hover:underline"
                  >
                    support@blooddonation.org
                  </Link>
                </div>
              </div>
            </div>
            <div className="w-full xl:w-6/12">
              <form
                data-aos="fade-left"
                data-aos-delay={1 * 200}
                onSubmit={handleSubmit}
                className="p-10 space-y-5 border w-full rounded-xl bg-white"
              >
                <div className="flex flex-wrap sm:flex-nowrap justify-between w-full gap-5">
                  <Input
                    name="name"
                    required
                    label="Name"
                    placeholder="Your name"
                  />
                  <Input
                    name="email"
                    type="email"
                    required
                    label="Email"
                    placeholder="example@gmail.com"
                  />
                </div>
                <div className="flex flex-wrap sm:flex-nowrap justify-between w-full gap-5">
                  <Input
                    name="phone"
                    type="tel"
                    label="Phone"
                    placeholder="Your phone number"
                  />
                  <Input
                    name="company"
                    label="Company"
                    placeholder="Hospital / blood bank / organization"
                  />
                </div>
                <div className="flex flex-wrap sm:flex-nowrap justify-between w-full gap-5">
                     <label htmlFor="contact-message" className="sr-only">Message</label>
                     <textarea
                     id="contact-message"
                    name="message"
                    rows={4}
                    required
                    className="border w-full p-5 rounded-xl max-h-[150px] placeholder:text-color-1/80"
                    placeholder="Leave us a message"
                  />
                </div>
                <Button type="submit" className="w-full md:w-fit">
                  Send message
                </Button>
              </form>
            </div>
          </div>
          <div className="w-full px-5 py-52 bg-red-500"></div>
        </div>
      </section>
    </>
  );
};

export default ContactUs;
