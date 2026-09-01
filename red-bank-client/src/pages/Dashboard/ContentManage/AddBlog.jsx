import { useState, useRef, useMemo, useContext, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import { PiSpinnerGapBold } from "react-icons/pi";
import { TOOLBAR_OPTIONS } from "@/lib/blogEditor";
import { useMutation } from "@tanstack/react-query";
import { BLOG_STATUS, THUMBNAIL_COMPRESSION, USER_ROLES } from "@/lib/constants";

const AddBlog = () => {
  const [content, setContent] = useState("");
  const editor = useRef(null);
  const isSubmittingRef = useRef(false);
  const { authData } = useContext(AuthContext);
  const [thumb, setthumb] = useState();
  const [status, setstatus] = useState();
  const [postPermalLinkAuto, setpostPermalLinkAuto] = useState("");
  const [readTimeAvg, setreadTimeAvg] = useState(0);
  const navigate = useNavigate();
  const {
    register: formFields,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setValue,
  } = useForm();

  const postTitle = watch("postTitle", "");
  const postDes = watch("postDes", "");

  const createMutation = useMutation({
    mutationFn: (formData) => blogService.create(formData),
    onSuccess: (res) => {
      reset();
      setthumb("");
      setContent("");
      setstatus("");
      setpostPermalLinkAuto("");
      Swal.fire({
        title: "Blog created successfully",
        icon: "success",
        text: "Your blog was successfully created and posted",
        confirmButtonText: "Close",
      });
      navigate(`../content-management/update-blog/${res?.data?._id}`);
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Something went wrong"),
    onSettled: () => {
      isSubmittingRef.current = false;
    },
  });
  const isSaving = createMutation.isPending;

  const handleDescriptionInput = (e) => {
    const maxLength = 400;
    const value = e.target.value;

    if (value.length > maxLength) {
      setValue("postDes", value.slice(0, maxLength));
    }
  };

  const handleTitleInput = (e) => {
    const maxLength = 120;
    const value = e.target.value;

    if (value.length <= maxLength) {
      setValue("postTitle", value);
    } else {
      setValue("postTitle", value.slice(0, maxLength));
    }
  };

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
    setContent(newContent);
    contentWordCount(newContent);
    setValue("content", newContent);
  };

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

  const handlePostSave = async (data) => {
    if (isSubmittingRef.current || createMutation.isPending) {
      return;
    }
    if (!postPermalLinkAuto) {
      toast.error("Enter a valid blog permal link");
      return;
    }
    if (!thumb) {
      toast.error("Upload blog thumbnail");
      return;
    }

    isSubmittingRef.current = true;

    let permalink = postPermalLinkAuto;
    try {
      const { data: permalinkData } = await blogService.verifyPermalink(
        permalink
      );
      permalink = permalinkData?.permalink;
    } catch {
      // keep the current permalink if verification fails
    }

    const formData = {
      postTitle: data?.postTitle,
      permalink,
      thumbnail: thumb,
      status: status || BLOG_STATUS.DRAFT,
      shortDescription: postDes,
      content: content,
      timeToRead: Number(readTimeAvg) || 0,
    };

    createMutation.mutate(formData);
  };

  const contentWordCount = (text) => {
    const plainText = text.replace(/<[^>]*>/g, "").trim();
    const count = plainText ? plainText.split(/\s+/).length : 0;
    const readingTimeInSeconds = (count / 200) * 60;
    const readingTimeInMinutes = readingTimeInSeconds / 60;
    setreadTimeAvg(readingTimeInMinutes?.toFixed(1));
  };

  useEffect(() => {
    if (status === undefined) {
      setstatus(
        authData?.role === USER_ROLES.ADMIN
          ? BLOG_STATUS.PUBLISHED
          : BLOG_STATUS.DRAFT
      );
    }
  }, [authData?.role, status]);

  return (
    <>
      <Helmet>
        <title>Add new blog | Red. Bank</title>
      </Helmet>
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Dashboard</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Content management</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add blog</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <motion.form
        onSubmit={handleSubmit(handlePostSave)}
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
              placeholder="Post Title"
              onBlur={(e) => {
                handleGeneratePermalink();
                handleTitleInput(e);
              }}
            />
            {errors.postTitle && <LineError error={errors.postTitle.message} />}
          </div>
          <div>
            <div className="flex items-end gap-2">
              <Input
                disabled={isSaving}
                label="Permalink *"
                value={postPermalLinkAuto}
                onChange={(e) =>
                  setpostPermalLinkAuto(
                    e.target.value.replace(/\s+/g, "-").toLowerCase()
                  )
                }
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
              ref={editor}
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
            <label className="block mb-1 font-semibold text-neutral-800">
              Publish
            </label>
            <span className="w-10 h-[1px] bg-brand-600/40 flex mb-[10px] rounded-full"></span>
            <button
              disabled={isSaving}
              type="submit"
              className="mt-2 flex justify-center gap-2 items-center px-5 w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-700 border border-red-500 transition-all hover:ring-4 ring-red-200 hover:bg-transparent hover:text-red-500"
            >
              Save
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

export default AddBlog;
