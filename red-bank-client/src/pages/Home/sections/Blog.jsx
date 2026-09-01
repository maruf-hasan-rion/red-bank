import TitleAndDes from "@/components/TitleAndDes";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import LineBrack from "@/components/ui/LineBrack";
import blogService from "@/services/blogService";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/button";
import QueryError from "@/components/shared/QueryError";

const Blog = () => {
  const { data: allPosts, isLoading, isError, refetch } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const { data } = await blogService.getPublic();
      return data;
    },
  });

  if (isError) return <QueryError onRetry={refetch} />;

  return (
    <>
      <TitleAndDes
        title={
          <>
            The Power of Giving Blood <LineBrack /> Donation Stories
          </>
        }
      >
        Discover inspiring stories and practical guidance on how blood donation
        <LineBrack /> saves lives — and how you can make a difference today.
      </TitleAndDes>
      <section className="flex justify-center w-full">
        <div className="px-5 pt-20 w-primary  gap-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {allPosts &&
            allPosts?.blogs?.map((post, index) => (
              <motion.article
                key={post?.postTitle}
                initial={{ opacity: 0, translateY: 250 }}
                whileInView={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="col-span-1 space-y-5 flex flex-col bg-white rounded-2xl border border-red-500/10 shadow-sm hover:shadow-md transition-all p-5"
              >
                <Link
                  to={`./blogs/${post?.permalink}`}
                  className="flex flex-col gap-5"
                >
                  <AspectRatio
                    ratio={3 / 2}
                    src={post?.thumbnail}
                    className="object-cover overflow-hidden !rounded-xl"
                    alt={post?.postTitle}
                  >
                    <img
                      src={post?.thumbnail}
                      alt="Image"
                      className="rounded-xl h-full w-full hover:scale-110 transition-all duration-500 object-cover"
                    />
                    <div className="backdrop-blur bg-white/90 ml-5 p-2 px-3 w-fit font-semibold rounded-md -mt-20 scale-90 text-xl font-2 border border-red-100">
                      {post?.timeToRead ? `${post?.timeToRead}m` : "Read"}
                      <br />
                      <span className="text-xs font-light -mt-1 flex">
                        {post?.timeToRead ? "read" : ""}
                      </span>
                    </div>
                  </AspectRatio>
                  <h2 className="text-xl font-semibold text-color-1 transition-all duration-700 hover:text-red-500">
                    {post?.postTitle}
                  </h2>
                </Link>
                {post?.shortDescription?.length > 0 && (
                  <p className="text-color-1/70 line-clamp-3">
                    {post?.shortDescription?.slice(0, 120)}
                  </p>
                )}
                <p className="px-3 py-1 bg-red-50 border border-red-100 text-red-600 w-fit rounded-full text-sm">
                  {moment(post?.createdAt).fromNow()}
                </p>
              </motion.article>
            ))}
          {isLoading &&
            [...Array(3)].map((_, index) => (
              <div key={index} className="col-span-1 space-y-5 flex flex-col">
                <div className="flex flex-col gap-5">
                  <AspectRatio
                    ratio={3 / 2}
                    className="object-cover overflow-hidden !rounded-2xl"
                  >
                    <Skeleton className={`w-full h-full`} />
                  </AspectRatio>
                  <div className="text-xl font-semibold transition-all duration-700 hover:text-red-500">
                    <Skeleton className={`w-full py-5`} />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className={`w-full p-2`} />
                    <Skeleton className={`w-9/12 p-2`} />
                  </div>
                </div>
                <Skeleton className={`w-5/12 p-4`} />
              </div>
            ))}
        </div>
      </section>
      <div className="flex justify-center py-20 pt-10 px-5">
        <Link data-aos="fade-up" to={"../blogs"}>
          <Button className="px-6">Browse more</Button>
        </Link>
      </div>
    </>
  );
};

export default Blog;
