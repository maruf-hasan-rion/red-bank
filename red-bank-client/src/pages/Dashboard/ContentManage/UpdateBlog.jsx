import { useState, useMemo, useContext, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "motion/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Input from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import LineError from "@/components/ui/LineError";
import generatePermalink from "@/lib/autoGeneratePermalink";
import JoditEditor from "jodit-react";
import { AuthContext } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageFrame from "@/assets/image.png";
import { TfiClose } from "react-icons/tfi";
import toast from "react-hot-toast";
import Upload from "@/lib/upload";
import imageCompression from "browser-image-compression";
import blogService from "@/services/blogService";
import Button from "@/components/ui/button";
import Swal from "sweetalert2";
import { Link, useParams } from "react-router-dom";
import { PiSpinnerGapBold, PiSpinnerGapThin } from "react-icons/pi";
import { TOOLBAR_OPTIONS } from "@/lib/blogEditor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NotFound from "@/pages/NotFound";
import { BLOG_STATUS, THUMBNAIL_COMPRESSION, USER_ROLES } from "@/lib/constants";

const UpdateBlog = () => {
  const { authData } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const isUpdatingRef = useRef(false);
  const [status, setstatus] = useState();
  const [readTimeAvg, setreadTimeAvg] = useState(0);
  const [content, setcontent] = useState("");

  // Vars
  const { id } = useParams();

  // State
  const [thumb, setthumb] = useState();
  const [postPermalLinkAuto, setpostPermalLinkAuto] = useState("");

  // handle Is Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      file &&
      file.type !== "image/webp" &&
      file.type !== "image/png" &&
      file.type !== "image/jpeg"
    ) {
      toast.error("Webp, Png, Jpeg format image");
      return;
    }
    try {
      const filCompressed = await imageCompression(file, THUMBNAIL_COMPRESSION);
      const { secure_url } = await Upload(filCompressed);
      setthumb(secure_url);
    } catch (error) {
      toast.error(error.message || "Failed to upload thumbnail");
    }
  };

  // React hook form
  const {
    register: formFields,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm();

  // React Watch
  const postTitle = watch("postTitle", "");
  const postDes = watch("postDes", "");

  // Valid Input
  const handleTitleInput = (e) => {
    const maxLength = 120;
    const value = e.target.value;

    if (value.length <= maxLength) {
      setValue("postTitle", value);
    } else {
      setValue("postTitle", value.slice(0, maxLength));
    }
  };

  const handleDescriptionInput = (e) => {
    const maxLength = 400;
    const value = e.target.value;

    if (value.length > maxLength) {
      setValue("postDes", value.slice(0, maxLength));
    }
  };

  // Auto generate permalink
  const handleGeneratePermalink = async () => {
    if (!postTitle?.trim()) {
      toast.error("Enter a title first to generate permalink");
      return;
    }
    try {
      const permalLink = await generatePermalink(postTitle);
      setpostPermalLinkAuto(permalLink);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to generate permalink");
    }
  };

  // Editor
  const config = useMemo(
    () => ({
      readonly: false,
      height: 600,
       buttons: TOOLBAR_OPTIONS,
      placeholder: "Type here...",
    }),
    []
  );

  const handleEditorChange = (newContent) => {
    setcontent(newContent);
    contentWordCount(newContent);
    setValue("content", newContent);
  };

  const contentWordCount = (text) => {
    const plainText = text.replace(/<[^>]*>/g, "").trim();
    const count = plainText ? plainText.split(/\s+/).length : 0;
    const readingTimeInSeconds = (count / 200) * 60;
    const readingTimeInMinutes = readingTimeInSeconds / 60;
    setreadTimeAvg(readingTimeInMinutes?.toFixed(1));
  };

  // Const fetch blog details by tanstack
  const fetchPostData = async () => {
    const { data } = await blogService.getManagementDetails(id);
    return data;
  };

  const {
    data: postDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blog-management", id],
    queryFn: fetchPostData,
    enabled: !!authData,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!postDetails) return;
    setValue("postTitle", postDetails.postTitle);
    setValue("postDes", postDetails.shortDescription);
    setthumb(postDetails.thumbnail);
    setreadTimeAvg(postDetails.timeToRead);
    setstatus(postDetails.status);
    setcontent(postDetails.content || "");
    setpostPermalLinkAuto(postDetails.permalink);
  }, [postDetails, setValue]);

  const updateMutation = useMutation({
    mutationFn: ({ id, updateData }) => blogService.update(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog-management", id] });
      Swal.fire({
        title: "Update Successful",
        icon: "success",
        text: "Post updated successfully",
        confirmButtonText: "Close",
      });
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message || "Something went wrong";
      Swal.fire({
        title: "Update failed",
        icon: "error",
        text: message,
        confirmButtonText: "Close",
      });
    },
    onSettled: () => {
      isUpdatingRef.current = false;
    },
  });
  const isSaving = updateMutation.isPending;

  // Handle Post Update
  const handlePostUpdate = (data) => {
    const updateData = {
      postTitle: data?.postTitle,
      permalink: postPermalLinkAuto,
      thumbnail: thumb,
      status: status || BLOG_STATUS.DRAFT,
      shortDescription: postDes,
      content: content,
      timeToRead: Number(readTimeAvg) || 0,
    };

    Swal.fire({
      title: "Are you sure?",
      icon: "question",
      text: "Sure you want to update post",
      showCancelButton: true,
      confirmButtonText: "Update",
    }).then(async (res) => {
      if (!res?.isConfirmed) {
        return;
      }
      if (updateMutation.isPending || isUpdatingRef.current) {
        return;
      }
      isUpdatingRef.current = true;

      let permalink = updateData.permalink;
      try {
        const { data: permalinkData } = await blogService.verifyPermalink(
          permalink,
          postDetails?._id
        );
        permalink = permalinkData?.permalink;
      } catch {
        // keep the current permalink if verification fails
      }

      updateMutation.mutate({
        id: postDetails?._id,
        updateData: { ...updateData, permalink },
      });
    });
  };

  if (isLoading) {
    return (
      <>
        <div
          className={`w-full rounded-xl h-screen items-center flex justify-center`}
        >
          <PiSpinnerGapThin size={100} className="animate-spin text-red-500" />
        </div>
      </>
    );
  }

  if (error) {
    return <NotFound />;
  }
  return (
    <>
      <Helmet>
        <title>
          Update - {postDetails?.postTitle || "Loading"} | Red. Bank
        </title>
      </Helmet>
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Dashboard</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Content management</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Update</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{postDetails?.postTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <motion.form
        onSubmit={handleSubmit(handlePostUpdate)}
        initial={{ translateY: 200, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        className="rounded-xl w-full justify-center flex flex-col xl:flex-row gap-10"
      >
        <div className="bg-white w-full rounded-lg p-5 space-y-5">
          <div>
            <div className="flex justify-between w-full">
              <label className="block mb-1 font-semibold text-neutral-800">
                Title *
              </label>
              <p>({postTitle?.length}/120)</p>
            </div>
            <Input
              disabled={isSaving}
              {...formFields("postTitle", {
                required: "Title is required",
              })}
               onChange={handleTitleInput}
               onBlur={handleGeneratePermalink}
              placeholder="Post Title"
            />
            {errors.postTitle && <LineError error={errors.postTitle.message} />}
          </div>
          <div>
            <div className="flex items-end gap-2">
              <Input
                disabled={isSaving}
                value={postPermalLinkAuto}
                onChange={(e) =>
                  setpostPermalLinkAuto(
                    e.target.value.replace(/\s+/g, "-").toLowerCase()
                  )
                }
                label="Permalink *"
                placeholder="my-blog-post"
              />
              <Button
                type="button"
                onClick={() => handleGeneratePermalink()}
                className="shrink-0"
              >
                Generate
              </Button>
            </div>
            <p className="text-sm pt-2">
              Link preview:{" "}
              <strong className="text-sm font-normal text-red-500">
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`${window.location.origin}/blogs/${postPermalLinkAuto}`}
                >
                  {window.location.origin}/blogs/{postPermalLinkAuto}
                </a>
              </strong>
            </p>
          </div>
          <div>
            <div className="flex justify-between w-full">
              <label className="block mb-1 font-semibold text-neutral-800">
                Description
              </label>
              <p>({postDes?.length}/400)</p>
            </div>
            <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
            <textarea
              disabled={isSaving}
              rows={4}
              {...formFields("postDes")}
              onInput={handleDescriptionInput}
              placeholder="Short description"
              className="p-2 text-sm border focus:border-red-400/50 focus:ring-4 transition-all ring-red-100 w-full rounded-md"
            ></textarea>
            {errors.postDes && <LineError error={errors.postDes.message} />}
          </div>
          <div>
            <label className="block mb-1 font-semibold text-neutral-800">
              Content
            </label>
            <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
            <JoditEditor
              disabled={isSaving}
              value={content}
              config={config}
              tabIndex={1}
              className="w-full"
              onChange={(newContent) => handleEditorChange(newContent)}
            />
          </div>
        </div>
        <div className="xl:w-[400px] space-y-5 w-full flex flex-col">
          <div className="p-5 rounded-lg bg-white order-last xl:order-first">
            <label className="mb-1 font-semibold flex w-full justify-between text-neutral-800">
              Publish
              <Link
                to={`/blogs/${postPermalLinkAuto || postDetails?.permalink}`}
                className="underline text-red-500"
              >
                Preview
              </Link>
            </label>
            <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
             <button
               disabled={isSaving}
               type="submit"
              className="mt-2 flex justify-center gap-2 items-center px-5 w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-700 border border-red-500 transition-all hover:ring-4 ring-red-200 hover:bg-transparent hover:text-red-500"
            >
              Update
              {isSaving && (
                <PiSpinnerGapBold size={20} className={`animate-spin`} />
              )}
            </button>
          </div>
          <div className="p-5 rounded-lg bg-white">
            <label className="block mb-1 font-semibold text-neutral-800">
              Time to read (minute)
            </label>
            <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
            <div className="px-3 py-2 border text-sm rounded-md bg-red-50 text-color-1">
              {readTimeAvg || 0}
            </div>
          </div>
          {authData?.role === USER_ROLES.ADMIN && (
            <div className="p-5 rounded-lg bg-white">
              <label className="block mb-1 font-semibold text-neutral-800">
                Status
              </label>
              <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
              <Select
                onValueChange={(e) => setstatus(e)}
                defaultValue={BLOG_STATUS.PUBLISHED}
                {...(status && { value: status })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BLOG_STATUS.PUBLISHED}>Published</SelectItem>
                  <SelectItem value={BLOG_STATUS.DRAFT}>Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="p-5 rounded-lg bg-white">
            <label className="block mb-1 font-semibold text-neutral-800">
              Image *
            </label>
            <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
            <input
              onChange={handleImageUpload}
              className="hidden"
              accept=".webp, .png, .jpg, .jpeg"
              id="thumb"
              type="file"
            />
            {thumb && (
              <div className="-mt-10 z-40 translate-y-16 flex relative ml-2">
                <button
                  type="button"
                  onClick={() => setthumb("")}
                  className="bg-neutral-100 p-2 border rounded-full"
                >
                  <TfiClose />
                </button>
              </div>
            )}
            <label htmlFor="thumb" className="w-fit flex flex-col pt-5">
              <div
                style={{ backgroundImage: `url('${thumb || ImageFrame}')` }}
                className="w-40 bg-center bg-cover bg-no-repeat cursor-pointer h-40 border rounded-md"
              ></div>
            </label>
          </div>
        </div>
      </motion.form>
    </>
  );
};

export default UpdateBlog;
