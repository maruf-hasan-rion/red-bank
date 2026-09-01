import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import frontendService from "@/services/frontendService";
import numeral from "numeral";
import moment from "moment";
import toast from "react-hot-toast";
import {
  TableCell,
  Table,
  TableRow,
  TableBody,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GiveFund from "./GiveFund";
import LineBrack from "@/components/ui/LineBrack";
import Button from "@/components/ui/button";
import { HiOutlinePlus } from "react-icons/hi2";
import { PiPrinterThin } from "react-icons/pi";
import useExportToPDF from "@/hooks/useExportToPDF";
import Pagination from "@/components/shared/Pagination";
import { Helmet } from "react-helmet-async";
import QueryError from "@/components/shared/QueryError";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Fund = () => {
  const [isOpenFund, setisOpenFund] = useState(false);
  const [limit, setlimit] = useState(10);
  const [page, setpage] = useState(1);

  const { data: allFunds, isLoading, isError, refetch } = useQuery({
    queryKey: ["allFunds", page, limit],
    queryFn: async () => {
      const { data } = await frontendService.getAllFunds(page, limit);
      return data;
    },
    refetchOnWindowFocus: false,
  });

  const { exportToPDF } = useExportToPDF("funds", "funds.pdf");

  if (isError) return <QueryError onRetry={refetch} />;

  const ExportToPDF = async () => {
    if (allFunds?.funds?.length < 1) {
      toast.error("No fund record to export");
      return;
    }

    exportToPDF();
  };

  const totalItems = allFunds?.totalItems ?? 0;

  return (
    <>
      <Helmet>
        <title>Fundings | Red. Bank</title>
      </Helmet>
      {isOpenFund && (
        <GiveFund refetch={refetch} setisOpenFund={setisOpenFund} />
      )}
      <section className="flex justify-center">
        <div className="w-primary items-center text-center justify-center px-5 py-10 pt-44 inline-flex">
          <div className="w-full md:w-9/12 space-y-5">
            <h2 className="text-3xl md:text-4xl font-medium font-2 text-color-1">
              Empower Lives Through Your <LineBrack />
              <strong className="text-red-500">Generosity</strong>
            </h2>
            <p className="text-color-1/80">
              Help us save lives! Your donations support blood donation
              drives, medical supplies, and community outreach programs.
              <LineBrack /> Join us in making a difference today!
            </p>
            <Button onClick={() => setisOpenFund(true)} size="lg">
              Give Fund
              <HiOutlinePlus />
            </Button>
          </div>
        </div>
      </section>
      <section className="px-5 flex justify-center">
        <div className="max-w-[1040px] w-full min-w-0 flex flex-col p-5 rounded-2xl bg-white shadow">
          <div
            data-html2canvas-ignore
            className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Contributions
              </h2>
              <p className="text-sm text-neutral-500">
                {totalItems > 0
                  ? `${totalItems} contribution${totalItems > 1 ? "s" : ""}`
                  : "No contributions yet"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setlimit(Number(value));
                  setpage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="10 per page" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={ExportToPDF}
                variant="outline"
                size="sm"
              >
                <PiPrinterThin size={16} />
                Print
              </Button>
            </div>
          </div>
          <Table id="funds" className="min-w-[560px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Funding Date</TableHead>
                <TableHead className="text-right">Avatar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading &&
                allFunds?.funds?.length > 0 &&
                allFunds.funds.map((fund, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap text-sm font-medium text-neutral-900">
                      {fund.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-semibold text-neutral-900">
                      {numeral((fund.amountMinor ?? fund.amount * 100) / 100).format("0.0a")} BDT
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-neutral-500">
                      {moment(fund.createdAt).fromNow()}
                    </TableCell>
                    <TableCell className="flex justify-end">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={fund.avatar} alt={fund.name} />
                        <AvatarFallback className="bg-brand-50 text-xs font-semibold text-brand-700">
                          {fund.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && allFunds?.funds?.length <= 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-lg font-semibold text-neutral-900 mb-1">
                        No funds yet
                      </p>
                      <p className="text-sm text-neutral-500 mb-5">
                        Be the first to contribute and support blood donation
                        drives.
                      </p>
                      <Button
                        onClick={() => setisOpenFund(true)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        Give Fund
                        <HiOutlinePlus />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {isLoading &&
                [...Array(8)].map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-5" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5" />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </section>
      <section className="flex justify-center py-5">
        <div className="w-full max-w-[1040px] px-5">
          {!isLoading && (
            <Pagination
              currentPage={page}
              totalPages={allFunds?.totalPages}
              onPageChange={setpage}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default Fund;
