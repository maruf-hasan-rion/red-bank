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
  TableHead,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import adminService from "@/services/adminService";
import donationService from "@/services/donationService";
import React, { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";
import { PiPrinterThin } from "react-icons/pi";
import Pagination from "@/components/shared/Pagination";
import useExportToPDF from "@/hooks/useExportToPDF";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
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
import { DONATION_STATUS, USER_ROLES } from "@/lib/constants";

const AllDonationsReq = () => {
  const { authData } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [currentPage, setcurrentPage] = useState(1);
  const [filterBarIsOpen, setfilterBarIsOpen] = useState(false);
  const [filter, setfilter] = useState("all");

  const fetchData = async () => {
    const { data } = await adminService.getPaginatedDonations(
      currentPage,
      10,
      filter === "all" ? undefined : filter
    );
    return data;
  };

  const { isLoading, isError, refetch, data: allDonations } = useQuery({
    queryKey: ["admin-donations", { page: currentPage, filter }],
    queryFn: fetchData,
    enabled: !!authData,
  });

  const filteredDonations = allDonations?.donations || [];
  const columnCount = authData?.role === USER_ROLES.VOLUNTEER ? 7 : 9;

  const { exportToPDF } = useExportToPDF("tableDonation", "donations.pdf");

  const invalidateDonations = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-donations"] });

  const statusMutation = useMutation({
    mutationFn: ({ status, id }) => donationService.update(id, { status }),
    onSuccess: () => {
      invalidateDonations();
      toast.success("Status updated successfully");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => donationService.delete(id),
    onSuccess: () => toast.success("Donation deleted successfully"),
    onError: () => toast.error("Failed to delete donation"),
  });

  if (isError) return <QueryError onRetry={refetch} />;

  const ExportToPDF = async () => {
    if (allDonations?.donations?.length < 1) {
      toast.error("No donation record to export");
      return;
    }

    exportToPDF();
  };

  const SetStatus = (status, data) => {
    Swal.fire({
      title: status === DONATION_STATUS.DONE ? "Donor donated?" : "Donor not donated?",
      text:
        status === DONATION_STATUS.DONE
          ? "If the donor donated blood for this request, mark it done."
          : "If the donor did not donate blood for this request, cancel it.",
      icon: "question",
      showCancelButton: true,
       confirmButtonText: status === DONATION_STATUS.DONE ? "Mark done" : "Cancel request",
    }).then((res) => {
      if (!res?.isConfirmed) {
        return;
      }
      statusMutation.mutate({ status, id: data?._id });
    });
  };

  const handleDonationDelete = (data) => {
    if (!data) {
      toast.error("Something went wrong");
      return;
    }
    if (authData?.role === USER_ROLES.VOLUNTEER) {
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

  return (
    <>
      <Helmet>
        <title>All blood donation requests | Red. Bank</title>
      </Helmet>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>All blood donation requests</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageTransition className="bg-white p-5 rounded-xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="shrink-0">
            <h2 className="text-lg font-semibold text-neutral-900">
              All donation requests
            </h2>
            <p className="text-sm text-neutral-500">
              {allDonations?.totalItems ?? 0} total requests
            </p>
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
            <Button variant="outline" size="sm" onClick={() => ExportToPDF()}>
              <PiPrinterThin size={16} />
              Export PDF
            </Button>
          </div>
        </div>
        <div className="w-full pb-3">
          <Table id="tableDonation" className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Recipient name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Donation date</TableHead>
                <TableHead>Blood group</TableHead>
                <TableHead>Donor info</TableHead>
                {authData?.role !== USER_ROLES.VOLUNTEER && (
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
              {allDonations &&
                !isLoading &&
                filteredDonations.map((don, index) => (
                  <React.Fragment key={don?._id || index}>
                    <TableRow>
                      <TableCell className="max-w-[180px] truncate whitespace-nowrap text-sm font-medium text-neutral-900">
                        {don?.recipientName}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate whitespace-nowrap text-sm text-neutral-500">
                        {don?.fullAddress}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                        {moment(don?.donationDate).format("YYYY MMMM D")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-neutral-700">
                        {don?.bloodGroup}
                      </TableCell>
                      <TableCell className="max-w-[240px] text-sm">
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
                      {authData?.role !== USER_ROLES.VOLUNTEER && (
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
                allDonations?.donations?.length > 0 &&
                filteredDonations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columnCount} className="py-8 text-center text-sm text-neutral-500">
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
          {allDonations?.donations?.length <= 0 && !isLoading && (
            <div className="py-10 text-center text-sm text-neutral-500">
              No donation requests found
            </div>
          )}
          {!isLoading && (
            <div className="pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={allDonations?.totalPages}
                onPageChange={setcurrentPage}
              />
              <p className="pb-2 text-center text-sm text-neutral-500">
                Showing {filteredDonations.length} of{" "}
                {allDonations?.totalItems ?? 0} requests
              </p>
            </div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default AllDonationsReq;
