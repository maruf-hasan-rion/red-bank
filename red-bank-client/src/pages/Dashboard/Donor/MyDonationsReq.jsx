import React, { useContext, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Helmet } from "react-helmet-async";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import donationService from "@/services/donationService";
import { AuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";
import { PiPrinterThin } from "react-icons/pi";
import Pagination from "@/components/shared/Pagination";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import useExportToPDF from "@/hooks/useExportToPDF";
import Button from "@/components/ui/button";
import QueryError from "@/components/shared/QueryError";
import PageTransition from "@/components/shared/PageTransition";
import StatusBadge from "@/components/shared/StatusBadge";
import DonationsFilter from "@/components/shared/DonationsFilter";
import {
  RowDeleteButton,
  RowEditButton,
  RowViewButton,
} from "@/components/shared/RowActions";
import { DONATION_STATUS } from "@/lib/constants";

const MyDonationsReq = () => {
  const [view, setView] = useState("mine");
  const [filter, setfilter] = useState("all");
  const [filterBarIsOpen, setfilterBarIsOpen] = useState(false);
  const [currentPage, setcurrentPage] = useState(1);

  const { authData } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const fetchData = async () => {
    const request =
      view === "mine"
        ? donationService.getPaginated(
            authData?.email,
            currentPage,
            10,
            filter === "all" ? undefined : filter
          )
        : donationService.getDonationsIJoined(
            authData?.email,
            currentPage,
            10,
            filter === "all" ? undefined : filter
          );
    const { data } = await request;
    return data;
  };

  const {
    data: myDonationsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "my-donations",
      { email: authData?.email, page: currentPage, view, filter },
    ],
    queryFn: fetchData,
    enabled: !!authData,
  });

  const invalidateMyDonations = () =>
    queryClient.invalidateQueries({ queryKey: ["my-donations"] });

  const deleteMutation = useMutation({
    mutationFn: (id) => donationService.delete(id),
    onSuccess: () => {
      invalidateMyDonations();
      toast.success("Donation deleted successfully");
    },
    onError: () => toast.error("Failed to delete donation"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, id }) => donationService.update(id, { status }),
    onSuccess: () => {
      invalidateMyDonations();
      toast.success("Status updated successfully");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const { exportToPDF } = useExportToPDF("tableDonation", "donations.pdf");

  if (isError) return <QueryError onRetry={refetch} />;

  const filteredDonations = myDonationsData?.donations || [];
  const columnCount = view === "mine" ? 9 : 6;

  const handleDonationDelete = (data) => {
    if (!data) {
      toast.error("Something went wrong");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this?",
      icon: "question",
      confirmButtonText: "Delete",
      showCancelButton: true,
      cancelButtonText: "No!",
    }).then((res) => {
      if (!res?.isConfirmed) {
        return;
      }
      deleteMutation.mutate(data?._id);
    });
  };

  const SetStatus = (status, data) => {
    if (view !== "mine") return;

    Swal.fire({
      title:
        status === DONATION_STATUS.DONE ? "Donor donated?" : "Donor not donated?",
      text:
        status === DONATION_STATUS.DONE
          ? "If the donor donated blood for your request, mark it done."
          : "If the donor did not donate blood for your request, cancel it.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText:
        status === DONATION_STATUS.DONE ? "Mark done" : "Cancel request",
    }).then((res) => {
      if (!res?.isConfirmed) {
        return;
      }
      statusMutation.mutate({ status, id: data?._id });
    });
  };

  const ExportToPDF = async () => {
    if (myDonationsData?.donations?.length < 1) {
      toast.error("No donation record to export");
      return;
    }
    exportToPDF();
  };

  return (
    <>
      <Helmet>
        <title>My Donation Request | Red. Bank</title>
      </Helmet>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>My Donation Request</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageTransition className="bg-white p-5 rounded-xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
            <button
              onClick={() => {
                setView("mine");
                setcurrentPage(1);
                setfilter("all");
              }}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                view === "mine"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              My Requests
            </button>
            <button
              onClick={() => {
                setView("donating");
                setcurrentPage(1);
                setfilter("all");
              }}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                view === "donating"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Requests I&apos;m Donating To
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DonationsFilter
              filter={filter}
              onFilterChange={(value) => {
                setfilter(value);
                setcurrentPage(1);
              }}
              isOpen={filterBarIsOpen}
              onToggleOpen={() => setfilterBarIsOpen(!filterBarIsOpen)}
            />
            <Button variant="outline" size="sm" onClick={ExportToPDF}>
              <PiPrinterThin size={16} />
              Export PDF
            </Button>
          </div>
        </div>
        <div className="w-full pb-3">
          <Table id="tableDonation" className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Recipient name</TableHead>
                <TableHead>Donation date</TableHead>
                <TableHead>Donation time</TableHead>
                <TableHead>Blood group</TableHead>
                {view === "mine" && (
                  <TableHead>Donor info</TableHead>
                )}
                {view === "mine" && (
                  <>
                    <TableHead data-html2canvas-ignore className="w-[48px]">
                      Edit
                    </TableHead>
                    <TableHead data-html2canvas-ignore className="w-[48px]">
                      Delete
                    </TableHead>
                  </>
                )}
                <TableHead data-html2canvas-ignore className="w-[48px]">
                  View
                </TableHead>
                <TableHead className="text-right w-[120px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myDonationsData &&
                !isLoading &&
                filteredDonations.map((don, index) => (
                  <React.Fragment key={don?._id || index}>
                    <TableRow>
                      <TableCell className="max-w-[180px] truncate whitespace-nowrap text-sm font-medium text-neutral-900">
                        {don?.recipientName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                        {moment(don?.donationDate).format("YYYY MMMM D")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                        {don?.donationTime}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-700">
                        {don?.bloodGroup}
                      </TableCell>
                      {view === "mine" && (
                        <TableCell className="max-w-[240px] whitespace-nowrap text-sm">
                          {don?.status === DONATION_STATUS.PENDING ? (
                            <span className="text-neutral-500">
                              Not responded anyone
                            </span>
                          ) : (
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-neutral-900">
                                {don?.donorName}
                              </p>
                              <p className="truncate text-sm text-neutral-500">
                                {don?.donorEmail}
                              </p>
                            </div>
                          )}
                        </TableCell>
                      )}
                      {view === "mine" && (
                        <>
                          <TableCell data-html2canvas-ignore>
                            <RowEditButton
                              to={`../donation/edit/${don?._id}`}
                              label="Edit donation request"
                            />
                          </TableCell>
                          <TableCell data-html2canvas-ignore>
                            <RowDeleteButton
                              label="Delete donation request"
                              onClick={() => handleDonationDelete(don)}
                              isPending={
                                deleteMutation.isPending &&
                                deleteMutation.variables === don?._id
                              }
                            />
                          </TableCell>
                        </>
                      )}
                      <TableCell data-html2canvas-ignore>
                        <RowViewButton
                          to={`../../donation/${don?._id}`}
                          label="View donation request"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusBadge
                          status={don?.status}
                          onMarkDone={() => SetStatus(DONATION_STATUS.DONE, don)}
                          onCancel={() =>
                            SetStatus(DONATION_STATUS.CANCELED, don)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}

              {!isLoading &&
                myDonationsData?.donations?.length > 0 &&
                filteredDonations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columnCount} className="text-start py-5">
                      No donations found for the selected filter.
                    </TableCell>
                  </TableRow>
                )}

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
          {myDonationsData?.donations?.length <= 0 && !isLoading && (
            <div className="py-10 text-center text-sm text-neutral-500">
              No blood donation request record found
            </div>
          )}
          {!isLoading && (
            <div className="pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={myDonationsData?.totalPages}
                onPageChange={setcurrentPage}
              />
              <p className="pb-2 text-center text-sm text-neutral-500">
                Showing {filteredDonations.length} of{" "}
                {myDonationsData?.totalItems ?? 0} requests
              </p>
            </div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default MyDonationsReq;
