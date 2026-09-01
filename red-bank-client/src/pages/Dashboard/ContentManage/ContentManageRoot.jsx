import { Helmet } from "react-helmet-async";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useContext, useEffect, useState } from "react";
import blogService from "@/services/blogService";
import { AuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import moment from "moment";
import { CiSearch } from "react-icons/ci";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/shared/Pagination";
import Button from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { GoPlus } from "react-icons/go";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import QueryError from "@/components/shared/QueryError";
import PageTransition from "@/components/shared/PageTransition";
import {
  RowDeleteButton,
  RowEditButton,
  RowViewButton,
} from "@/components/shared/RowActions";
import { cn } from "@/lib/utils";
import { BLOG_STATUS, DEBOUNCE_DELAY, USER_ROLES } from "@/lib/constants";

const ContentManageRoot = () => {
  const [currentPage, setcurrentPage] = useState(1);
  const [filter, setfilter] = useState("all");
  const [searchInput, setsearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY);

  const { authData } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const columnCount = authData?.role === USER_ROLES.ADMIN ? 8 : 7;

  const fetchAllData = async () => {
    const { data } = await blogService.getPaginated(
      currentPage,
      10,
      debouncedSearch,
      filter
    );
    return data;
  };

  const {
    data: allBlogs,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["blogs", { page: currentPage, search: debouncedSearch, filter }],
    queryFn: fetchAllData,
    enabled: !!authData,
  });

  useEffect(() => {
    setcurrentPage(1);
  }, [debouncedSearch, filter]);

  const invalidateBlogs = () =>
    queryClient.invalidateQueries({ queryKey: ["blogs"] });

  const deleteMutation = useMutation({
    mutationFn: (id) => blogService.delete(id),
    onSuccess: () => {
      invalidateBlogs();
      Swal.fire({
        icon: "success",
        title: "Post deleted successfully",
        text: "Tap close button to close this modal",
        confirmButtonText: "Close",
      });
    },
    onError: () => toast.error("Failed to delete post"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, id }) => blogService.update(id, { status }),
    onSuccess: (_, { type }) => {
      invalidateBlogs();
      Swal.fire({
        icon: "success",
        title: `Post successfully ${type ? "Published" : "Unpublished"}`,
        text: "Tap close button to close this modal",
        confirmButtonText: "Close",
      });
    },
    onError: () => toast.error("Failed to update post status"),
  });

  if (isError) return <QueryError onRetry={refetch} />;

  const handleDelete = (post) => {
    Swal.fire({
      title: `Are you sure?`,
      icon: "question",
      text: `Are you sure? you want to delete this post`,
      confirmButtonText: "Delete",
      showCancelButton: true,
    }).then((res) => {
      if (!res.isConfirmed) {
        return;
      }
      deleteMutation.mutate(post?._id);
    });
  };

  const SetStatus = (type, post) => {
    if (authData?.role !== USER_ROLES.ADMIN) {
      toast.error("Something went wrong");
      return;
    }
    const status = type ? BLOG_STATUS.PUBLISHED : BLOG_STATUS.DRAFT;

    Swal.fire({
      title: `${type ? "Publish" : "Draft"} this post`,
      icon: "question",
      text: `Are you sure? you want to ${type ? "Publish" : "Unpublish"}`,
      confirmButtonText: "Yes!",
      showCancelButton: true,
    }).then((res) => {
      if (!res.isConfirmed) {
        return;
      }
      statusMutation.mutate({ status, id: post?._id, type });
    });
  };
  return (
    <>
      <Helmet>
        <title>Content Management | Red. Bank</title>
      </Helmet>
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Dashboard</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Content management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <PageTransition className="bg-white p-5 rounded-xl">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Content management
            </h2>
            <p className="text-sm text-neutral-500">
              {allBlogs?.totalItems ?? 0} total posts
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <CiSearch
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <Input
                value={searchInput}
                onChange={(e) => setsearchInput(e.target.value)}
                placeholder="Search blog..."
                aria-label="Search blog"
                className="h-9 pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={filter}
                onValueChange={(e) => {
                  setfilter(e);
                  setcurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Link to={`./add-blog`}>
                <Button size="sm" className="gap-2">
                  Create Post <GoPlus />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full pb-3">
          <Table id="tableDonation" className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">Image</TableHead>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Short Description</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead data-html2canvas-ignore className="w-[48px]">
                  Edit
                </TableHead>
                {authData?.role === USER_ROLES.ADMIN && (
                  <TableHead data-html2canvas-ignore className="w-[48px]">
                    Delete
                  </TableHead>
                )}
                <TableHead data-html2canvas-ignore className="w-[48px]">
                  View
                </TableHead>
                <TableHead className="text-right w-[120px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allBlogs &&
                !isLoading &&
                allBlogs?.blogs.map((post, index) => (
                    <React.Fragment key={index}>
                      <TableRow>
                        <TableCell>
                          <Link to={`./update-blog/${post?._id}`}>
                            <img
                              src={post?.thumbnail}
                              className="h-16 w-16 rounded-lg border border-neutral-200 object-cover transition-all hover:object-left-bottom"
                              alt={post?.postTitle}
                            />
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate">
                          <Link
                            to={`./update-blog/${post?._id}`}
                            className="text-sm font-medium text-neutral-900 hover:underline"
                          >
                            {post?.postTitle}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate text-sm text-neutral-500">
                          {post?.shortDescription?.slice(0, 120) ||
                            "not provided"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                          {moment(post?.createdAt).fromNow()}
                        </TableCell>
                          <TableCell data-html2canvas-ignore>
                            <RowEditButton
                              to={`./update-blog/${post?._id}`}
                              label="Edit blog post"
                            />
                        </TableCell>
                        {authData?.role === USER_ROLES.ADMIN && (
                          <TableCell data-html2canvas-ignore>
                            <RowDeleteButton
                              label="Delete blog post"
                              onClick={() => handleDelete(post)}
                              isPending={
                                deleteMutation.isPending &&
                                deleteMutation.variables === post?._id
                              }
                            />
                          </TableCell>
                        )}
                        <TableCell data-html2canvas-ignore>
                          <RowViewButton
                            to={`../../blogs/${post?.permalink}`}
                            label="View blog post"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {authData?.role === USER_ROLES.ADMIN ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  aria-label={`Change status for ${post?.postTitle}`}
                                  className={cn(
                                    "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors hover:ring-2 hover:ring-offset-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                                    post?.status === BLOG_STATUS.PUBLISHED
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                                  )}
                                >
                                  <span className="capitalize">{post?.status}</span>
                                  <ChevronDown size={14} className="opacity-70" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-40 p-1" align="end">
                                {post?.status === BLOG_STATUS.PUBLISHED ? (
                                  <button
                                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-neutral-100"
                                    onClick={() => SetStatus(false, post)}
                                  >
                                    Unpublish
                                  </button>
                                ) : (
                                  <button
                                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-neutral-100"
                                    onClick={() => SetStatus(true, post)}
                                  >
                                    Publish
                                  </button>
                                )}
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <div className="flex justify-end">
                              <Badge
                                variant={
                                  post?.status === BLOG_STATUS.PUBLISHED
                                    ? "success"
                                    : "neutral"
                                }
                                className="w-fit capitalize"
                              >
                                {post?.status}
                              </Badge>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
              {isLoading &&
                   [...Array(6)].map((_, index) => (
                     <TableRow key={index}>
                       {[...Array(columnCount)].map((__, cellIndex) => (
                         <TableCell key={cellIndex}>
                           <Skeleton className="w-full h-10" />
                         </TableCell>
                       ))}
                     </TableRow>
                   ))}
            </TableBody>
          </Table>
          {allBlogs?.blogs?.length <= 0 && !isLoading && (
            <div className="py-10 text-center text-sm text-neutral-500">
              No blog posts found
            </div>
          )}
          {!isLoading && (
            <div className="pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={allBlogs?.totalPages}
                onPageChange={setcurrentPage}
              />
              <p className="pb-2 text-center text-sm text-neutral-500">
                Showing {allBlogs?.blogs?.length ?? 0} of{" "}
                {allBlogs?.totalItems ?? 0} posts
              </p>
            </div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default ContentManageRoot;
