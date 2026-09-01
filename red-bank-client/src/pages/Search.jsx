import { useSearchParams } from "react-router-dom";
import Line1 from "@/assets/line1.svg";
import Line2 from "@/assets/line2.svg";
import LineBrack from "@/components/ui/LineBrack";
import { motion } from "motion/react";
import SelectDistrictAndUpazila from "@/components/ui/SelectDistrictAndUpazila";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import frontendService from "@/services/frontendService";
import toast from "react-hot-toast";
import SearchImgURI from "@/assets/search.webp";
import SorryEmoji from "@/assets/sorryemoji.webp";
import { Helmet } from "react-helmet-async";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { TfiClose } from "react-icons/tfi";
import { RiResetRightFill } from "react-icons/ri";
import { BLOOD_GROUPS } from "@/lib/constants";
import Button from "@/components/ui/button";
import { PageLoader } from "@/components/shared/PageLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import QueryError from "@/components/shared/QueryError";

const Search = () => {
  const [params, setSearchParams] = useSearchParams();
  const queryDistrict = params.get("district");
  const queryUpazila = params.get("upazila");
  const queryBloodGroup = params.get("bloodGroup");

  const [bloodGroup, setBloodGroup] = useState(queryBloodGroup || null);
  const [selectedDisAndUp, setSelectedDisAndUp] = useState(() => ({
    district: queryDistrict ? { value: queryDistrict, label: queryDistrict } : null,
    upazila: queryUpazila ? { value: queryUpazila, label: queryUpazila } : null,
  }));
  const [hasSearched, setHasSearched] = useState(
    Boolean(queryDistrict || queryUpazila || queryBloodGroup)
  );

  useEffect(() => {
    setBloodGroup(queryBloodGroup || null);
    setSelectedDisAndUp({
      district: queryDistrict ? { value: queryDistrict, label: queryDistrict } : null,
      upazila: queryUpazila ? { value: queryUpazila, label: queryUpazila } : null,
    });
    setHasSearched(Boolean(queryDistrict || queryUpazila || queryBloodGroup));
  }, [queryDistrict, queryUpazila, queryBloodGroup]);
  const filterQuery = {
    district: selectedDisAndUp?.district?.value || undefined,
    upazila: selectedDisAndUp?.upazila?.value || undefined,
    blood: bloodGroup || undefined,
  };

  const activeFilters = [
    { type: "district", label: selectedDisAndUp?.district?.label },
    { type: "upazila", label: selectedDisAndUp?.upazila?.label },
    { type: "blood", label: bloodGroup },
  ].filter((f) => f.label);

  const hasValidQuery = () =>
    Boolean(filterQuery.district || filterQuery.upazila || filterQuery.blood);

  const fetchData = async () => {
    const { data } = await frontendService.getAllDonors(filterQuery);
    return data;
  };

  const {
    data: donorsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["donorData", JSON.stringify(filterQuery)],
    queryFn: fetchData,
    enabled: hasSearched && hasValidQuery(),
  });

  if (isError) return <QueryError onRetry={refetch} />;

  const handleSearch = () => {
    if (!hasValidQuery()) {
      toast.error("Add a valid filter query");
      return;
    }
    setHasSearched(true);
    const nextParams = new URLSearchParams();
    Object.entries(filterQuery).forEach(([key, value]) => {
      if (value) nextParams.set(key === "blood" ? "bloodGroup" : key, value);
    });
    setSearchParams(nextParams, { replace: true });
  };

  const handleRemoveFilter = (type) => {
    const nextFilters = {
      ...filterQuery,
      [type]: undefined,
    };

    if (type === "district") nextFilters.upazila = undefined;

    if (type === "blood") {
      setBloodGroup(null);
    } else {
      setSelectedDisAndUp((prev) => ({
        ...prev,
        [type]: null,
        ...(type === "district" ? { upazila: null } : {}),
      }));
    }
    const nextParams = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) nextParams.set(key === "blood" ? "bloodGroup" : key, value);
    });
    setSearchParams(nextParams, { replace: true });
  };

  const handleClearFilters = () => {
    setBloodGroup(null);
    setSelectedDisAndUp({ district: null, upazila: null });
    setHasSearched(false);
    setSearchParams({}, { replace: true });
  };

  const handleDistrictUpazilaChange = (data) => {
    setSelectedDisAndUp(data);
  };

  return (
    <>
      <Helmet>
        <title>Search blood donors | Red. Bank</title>
      </Helmet>
      <section className="flex justify-center px-5 mt-40 items-center">
        <div className=" max-w-site w-full items-center overflow-hidden flex flex-col bg-red-50 rounded-2xl border border-red-500/30 bg-contain bg-center bg-no-repeat ">
          <div className="flex w-full justify-between z-10">
            <div className="w-6/12">
              <motion.img
                initial={{ opacity: 0, scale: 0.8, translateX: -50 }}
                whileInView={{ opacity: 1, scale: 1, translateX: 0 }}
                width={200}
                src={Line1}
                alt="Line 1"
              />
            </div>
            <div className="w-6/12 flex justify-end z-30">
              <motion.img
                initial={{ opacity: 0, scale: 0.8, translateX: 50, rotate: -90 }}
                whileInView={{ opacity: 1, scale: 1, translateX: 0 }}
                width={380}
                className="-translate-y-8"
                src={Line2}
                alt="Line 1"
              />
            </div>
          </div>
          <div className="w-full -mt-[200px] pb-20 flex justify-center px-5 z-50 relative">
            <div className="absolute blur-lg bg-white/20 w-full h-40"></div>
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-2 font-semibold">
                Search for donors
              </h2>
              <p>
                Your blood donation can make the difference between life and
                death for someone in need.
                <LineBrack /> Join us in saving lives by donating blood today.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="justify-center flex pb-20">
        <div className="flex w-full max-w-site flex-col items-center">
          <div className="flex w-9/12 gap-5 border p-5 pb-0 rounded-2xl -mt-10 z-50 bg-white ">
            <div className="flex w-full flex-wrap pb-5 xl:pb-0 xl:flex-nowrap gap-5">
              <SelectDistrictAndUpazila
                 defaultDistrict={selectedDisAndUp?.district?.value || null}
                 defaultUpazila={selectedDisAndUp?.upazila?.value || null}
                className={`mb-0 xl:mb-4`}
                withoutLabel={true}
                setData={handleDistrictUpazilaChange}
              />
              <Select
                 value={bloodGroup || ""}
                 onValueChange={setBloodGroup}
              >
                <SelectTrigger className="w-full bg-white/40">
                  <SelectValue placeholder="Blood group" />
                </SelectTrigger>
                <SelectContent>
                   {BLOOD_GROUPS.map((group) => (
                     <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                className="w-full xl:w-fit mb-5"
              >
                Search
              </Button>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="w-full xl:w-fit mb-5 flex items-center justify-center gap-2"
              >
                <RiResetRightFill />
                Clear
              </Button>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex w-9/12 flex-wrap items-center gap-2 pt-5">
              <span className="text-sm font-medium text-color-1/70">
                Applied:
              </span>
              {activeFilters.map((f) => (
                <button
                  key={f.type}
                  onClick={() => handleRemoveFilter(f.type)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  {f.label}
                  <TfiClose size={10} />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      {hasSearched && hasValidQuery() ? (
        <>
          {isLoading || isFetching ? (
            <PageLoader />
          ) : (
            <>
              {donorsData?.donors?.length <= 0 ? (
                <EmptyState
                  icon={<img src={SorryEmoji} width={200} height={200} alt="Donor not found" />}
                  title="Sorry, we couldn't find any donors"
                  description="Please try applying a different filter query to locate a suitable donor. This might help in finding the best match for your needs."
                  className="pb-20"
                />
              ) : (
                <section className="flex justify-center">
                  <div className="px-5 w-primary grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 place-items-center">
                    {donorsData?.donors?.map((donor, index) => (
                      <div
                        data-aos="fade-up"
                        data-aos-delay={index * 200}
                        key={donor?._id || index}
                        className="bg-white space-y-5 col-span-1 w-full p-5 rounded-[16px]"
                      >
                        <div className="flex flex-wrap w-full gap-5 items-center">
                          <img
                            width={60}
                            className="ring-4 rounded-full ring-red-500/50"
                            src={donor?.avatar}
                            alt={donor?.name}
                          />
                          <div className="flex flex-col">
                            <h2 className="text-lg font-semibold">
                              {donor?.name}
                            </h2>
                            <p className="-mt-2">{donor?.email}</p>
                          </div>
                        </div>
                        <hr />
                        <ol className="list-disc ml-10">
                          <li>Blood group - {donor?.bloodGroup}</li>
                          <li>District - {donor?.district}</li>
                          <li>Upazila - {donor?.upazila}</li>
                        </ol>
                        <hr />
                        <Button asChild className="w-full">
                          <a
                            target="_blank"
                            rel="noreferrer"
                            href={`mailto:${donor?.email}`}
                          >
                            Contact
                            <HiOutlineEnvelope />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      ) : (
        <EmptyState
          icon={<img src={SearchImgURI} width={300} height={300} alt="Search image" />}
          title="Search for your donor"
          description="To find the donor you're looking for, just fill out the form above and click the search button! We're here to help you on your journey!"
          className="pb-40"
        />
      )}
    </>
  );
};

export default Search;
