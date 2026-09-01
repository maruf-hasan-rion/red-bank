import { AspectRatio } from "@/components/ui/aspect-ratio";
import LineBrack from "@/components/ui/LineBrack";
import blogService from "@/services/blogService";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { SOCIAL_LINKS } from "@/lib/socialLinks";
import { HiOutlineEnvelope } from "react-icons/hi2";
import Button from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { EmptyState } from "@/components/shared/EmptyState";
import QueryError from "@/components/shared/QueryError";
import { DEBOUNCE_DELAY } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import frontendService from "@/services/frontendService";
import toast from "react-hot-toast";

const Blogs = () => {
  const [limit, setlimit] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, DEBOUNCE_DELAY);

  const subscribeMutation = useMutation({
    mutationFn: (email) => frontendService.subscribe(email),
    onSuccess: () => toast.success("Email successfully subscribed"),
    onError: (err) => {
      if (err.response?.data?.message === "Email already subscribed") {
        toast.error("Email already subscribed");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const fetchAllPost = async () => {
    const { data } = await blogService.getPublic(
      debouncedSearch || undefined,
      limit
    );
    return data;
  };

  const {
    data: allPosts,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["allPosts", limit, debouncedSearch],
    queryFn: fetchAllPost,
  });

  return (
    <>
      <section className="flex justify-center py-10 pb-0">
        <div className="w-primary px-5 flex flex-col pb-10 pt-40 border-dashed border-b gap-8 border-b-red-500/20 mb-10">
          <h2
            data-aos="fade-up"
            className="text-4xl md:text-5xl font-medium font-2 text-color-1"
          >
            Discover our latest
            <LineBrack /> <strong className="text-red-500">blog</strong> posts
          </h2>
          <p data-aos="fade-up" className="max-w-3xl text-color-1/80">
            Discover the impact of blood donation, inspiring stories, and how
             you can be a hero in someone&apos;s life. Join us,
            <LineBrack /> in spreading awareness and saving lives through the
            gift of blood
          </p>
        </div>
      </section>
      <section className="flex justify-center -mb-20">
        <div className="w-primary px-5 gap-5 flex flex-col-reverse xl:flex-row justify-between">
          <div className="w-full xl:w-9/12 flex flex-col gap-6 xl:border-r border-red-100 xl:pr-5">
            {allPosts?.blogs?.length > 0 &&
              allPosts?.blogs?.map((post, index) => (
                <motion.article
                  initial={{ opacity: 0, translateY: 200 }}
                  whileInView={{ opacity: 1, translateY: 0 }}
                  transition={{ duration: 0.4 }}
                  key={post?._id || index}
                  className="bg-white rounded-2xl border border-red-500/10 shadow-sm hover:shadow-md transition-all p-4 flex gap-5 flex-col min-[600px]:flex-row items-center"
                >
                  <Link
                    to={`./${post?.permalink}`}
                    className="w-full min-[600px]:w-4/12"
                  >
                    <AspectRatio
                      ratio={3 / 3}
                      className="rounded-xl overflow-hidden"
                    >
                      <img
                        src={post.thumbnail}
                        loading="lazy"
                        className="w-full duration-500 hover:scale-110 transition-all h-full object-cover"
                        alt={post?.postTitle}
                      />
                    </AspectRatio>
                  </Link>
                  <div className="w-full min-[600px]:w-8/12 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-color-1/60">
                      <span>{moment(post?.createdAt).format("MMM D, YYYY")}</span>
                      {post?.timeToRead ? (
                        <>
                          <span className="w-1 h-1 rounded-full bg-red-400" />
                          <span>{post?.timeToRead} min read</span>
                        </>
                      ) : null}
                    </div>
                    <Link
                      to={`./${post?.permalink}`}
                      className="text-xl transition-all hover:text-red-500 sm:text-2xl font-2 text-color-1"
                    >
                      {post?.postTitle}
                    </Link>
                    {post?.shortDescription && (
                      <p className="text-color-1/70 line-clamp-3">
                        {post?.shortDescription}
                      </p>
                    )}
                    <Link
                      className="flex border-b-[1px] group items-center gap-2 w-fit border-red-500/30 text-red-500 font-medium"
                      to={`./${post?.permalink}`}
                    >
                      Read post{" "}
                      <IoIosArrowRoundForward
                        size={20}
                        className="group-hover:translate-x-2 transition-all"
                      />
                    </Link>
                  </div>
                </motion.article>
              ))}
            {isLoading &&
              [...Array(5)].map((_, index) => (
                <div
                  key={`loader-${index}`}
                  className="bg-white rounded-2xl border border-red-500/10 p-4 flex gap-5 items-center"
                >
                  <div className="w-4/12">
                    <AspectRatio
                      ratio={3 / 3}
                      className="rounded-xl overflow-hidden"
                    >
                      <Skeleton className="w-full h-full object-cover" />
                    </AspectRatio>
                  </div>
                  <div className="w-8/12 space-y-5">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  </div>
                </div>
              ))}
            {isError && <QueryError onRetry={refetch} />}
            {!isLoading && !isError && allPosts?.blogs?.length === 0 && (
              <EmptyState
                title="No blog posts found"
                description="No posts match your search. Try a different keyword or clear the search."
              />
            )}
            {!isLoading && !isError && allPosts?.blogs?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, translateY: 200 }}
                whileInView={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 0.4 }}
              >
                {allPosts.blogs.length !== allPosts.blogsCount ? (
                  <Button
                    onClick={() => setlimit(limit + 5)}
                    className="mt-5 w-full"
                  >
                    Load more posts
                  </Button>
                ) : (
                  <p className="text-lg p-5 py-3 border-red-100 bg-red-50 text-color-1 border rounded-xl text-center">
                    No more blog posts were found
                  </p>
                )}
              </motion.div>
            )}
          </div>
          <div className="w-full xl:w-4/12 space-y-8">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="w-full flex p-2 border-red-100 border rounded-xl bg-white"
            >
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search post"
                className="w-full bg-transparent p-3 placeholder:text-color-1/60 text-color-1"
              />
              <Button type="submit" className="shrink-0">Search</Button>
            </form>
            <ul className="hidden xl:block">
              <h3 className="text-xl font-2 text-color-1">Follow us on</h3>
              <span className="flex w-2/12 my-2 h-[1px] bg-red-200"></span>
               {SOCIAL_LINKS.map((li) => (
                   <a className="flex py-2" key={li.name} href={li.path} target="_blank" rel="noreferrer">
                     <span className="border flex items-center justify-start gap-5 text-color-1 px-5 py-3 hover:bg-red-50 hover:text-red-600 transition-all w-full border-red-200 rounded-md">
                       <span className="text-xl">{li?.icon}</span>
                       {li?.name}
                     </span>
                   </a>
                 ))}
            </ul>
            <ul className="hidden xl:block">
              <h3 className="text-xl font-2 text-color-1">Newsletter</h3>
              <span className="flex w-2/12 my-2 h-[1px] bg-red-200"></span>
              <div className="bg-red-600 space-y-5 text-white p-5 mt-4 rounded-2xl">
                <HiOutlineEnvelope
                  size={50}
                  className="bg-white/10 p-2 rounded-md"
                />
                <h3 className="text-3xl font-semibold">
                  Subscribe to our
                  <br /> newsletter
                </h3>
                <p>
                  Get the latest updates and insights straight to your inbox.
                  Join now and never miss out!
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    subscribeMutation.mutate(e.target.email.value);
                    e.target.reset();
                  }}
                  className="w-full flex p-2 border-white/30 border rounded-lg bg-white/10"
                >
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full bg-transparent p-3 placeholder:text-white/70"
                  />
                  <button className="px-5 py-3 bg-white text-red-600 font-medium rounded-md">
                    Subscribe
                  </button>
                </form>
              </div>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blogs;
