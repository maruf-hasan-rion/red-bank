import Marquee from "@/components/ui/marquee";

const Review = () => {
 return (
 <>
 <section className="flex justify-center pb-10">
 <div className="w-primary px-5 py-10 relative flex h-[500px] flex-col items-center justify-center overflow-hidden">
 <div
 data-aos="fade-down"
 className="flex w-full justify-start flex-col z-[999]"
 >
 <h3 className="text-4xl font-semibold text-color-1">
 Donor Reviews
 </h3>
 <span className="w-20 h-1 bg-red-500 flex my-5"></span>
 <p className="pb-10 text-color-1/80">
 Our donors value the simplicity and effectiveness of the
 platform. Here&apos;s what they say.
 </p>
 </div>
 <Marquee data-aos="fade-right" reverse className="[--duration:20s]">
 {reviews.map((review, index) => (
 <div
 key={`right-${index}`}
 className="w-[300px] cursor-pointer hover:bg-black/5 transition-all border p-5 rounded-xl border-red-500/10 bg-white"
 >
 <div className="flex items-center gap-2">
 <img
 src={review?.img}
 className="w-10 h-10 object-cover rounded-full"
 alt={review?.name}
 />
 <div className="flex flex-col">
 <figcaption className="text-sm font-medium ">
 {review?.name}
 </figcaption>
 <p className="text-xs font-medium ">
 {review?.username}
 </p>
 </div>
 </div>
 <blockquote className="mt-2 text-sm">{review?.body}</blockquote>
 </div>
 ))}
 </Marquee>

 <Marquee data-aos="fade-left" className="[--duration:20s]">
 {reviews.map((review, index) => (
 <figure
 key={`left-${index}`}
 className="w-[300px] h-fit border p-5 rounded-xl border-red-500/10 bg-white"
 >
 <div className="flex items-center gap-2">
 <img
 src={review?.img}
 className="w-10 h-10 object-cover rounded-full"
 alt={review?.name}
 />
 <div className="flex flex-col">
 <figcaption className="text-sm font-medium ">
 {review?.name}
 </figcaption>
 <p className="text-xs font-medium ">
 {review?.username}
 </p>
 </div>
 </div>
 <blockquote className="mt-2 text-sm">{review?.body}</blockquote>
 </figure>
 ))}
 </Marquee>

 <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#f9f1ef] "></div>
 <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#f9f1ef] "></div>
 </div>
 </section>
 </>
 );
};

export default Review;

const reviews = [
 {
 name: "Rashed",
 username: "@rashedbd",
 body: "The platform made blood donation easy. I found a donor within hours — it really is life-changing.",
 img: "https://avatar.vercel.sh/jack",
 },
 {
 name: "Maya",
 username: "@maya_bd",
 body: "A truly convenient service for blood donation. The whole process was smooth and reassuring.",
 img: "https://avatar.vercel.sh/jill",
 },
 {
 name: "Arif",
 username: "@arif_donor",
 body: "I was matched with a donor quickly and safely. Thanks to the platform, I could help when it mattered most.",
 img: "https://avatar.vercel.sh/john",
 },
 {
 name: "Soma",
 username: "@soma_requester",
 body: "Requesting blood for my father was effortless. The support team and donors were incredibly kind.",
 img: "https://avatar.vercel.sh/jane",
 },
 {
 name: "Shahina",
 username: "@shahina_blood",
 body: "A very smooth experience from start to finish. I'll keep donating because it's so simple now.",
 img: "https://avatar.vercel.sh/jenny",
 },
 {
 name: "Imran",
 username: "@imran_donor",
 body: "A great initiative connecting donors and recipients. Every donation here truly saves lives.",
 img: "https://avatar.vercel.sh/james",
 },
];
