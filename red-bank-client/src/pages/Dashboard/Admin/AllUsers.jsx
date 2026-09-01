import React, { useContext, useEffect, useState } from "react";
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
import { CiSearch } from "react-icons/ci";
import { RiResetRightFill } from "react-icons/ri";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import adminService from "@/services/adminService";
import authService from "@/services/authService";
import { Skeleton } from "@/components/ui/skeleton";
import useExportToPDF from "@/hooks/useExportToPDF";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/shared/Pagination";
import { Ban, ChevronDown, RotateCcw } from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Button from "@/components/ui/button";
import { PiPrinterThin } from "react-icons/pi";
import { useDebounce } from "@/hooks/useDebounce";
import QueryError from "@/components/shared/QueryError";
import PageTransition from "@/components/shared/PageTransition";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { DEBOUNCE_DELAY, USER_ROLES, USER_STATUS } from "@/lib/constants";

const ROLE_STYLES = {
  [USER_ROLES.ADMIN]: "bg-sky-50 text-sky-700 border border-sky-200",
  [USER_ROLES.VOLUNTEER]: "bg-amber-50 text-amber-700 border border-amber-200",
  [USER_ROLES.DONOR]: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const MENU_ITEM_CLASS =
  "w-full rounded-md px-3 py-2 text-left text-sm hover:bg-neutral-100";

const MENU_DIVIDER = "mx-2 my-1 border-t border-neutral-100";

const AllUser = () => {
  const { authData, setAuthData } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [filterByStatus, setfilterByStatus] = useState("all");
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY);

  const fetchData = async () => {
    const { data } = await adminService.getPaginatedUsers(
      currentPage,
      10,
      debouncedSearch.trim() || undefined,
      filterByStatus === "all" ? undefined : filterByStatus
    );
    return data;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data: allUserData, isLoading, isError, refetch } = useQuery({
    queryKey: ["users", { page: currentPage, search: debouncedSearch, status: filterByStatus }],
    queryFn: fetchData,
    enabled: !!authData,
  });

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ["users"] });

  const refreshAuthUser = () =>
    authService.getUser().then((res) => setAuthData(res?.data));

  const roleMutation = useMutation({
    mutationFn: ({ role, user }) => adminService.updateUserRole(user._id, role),
    onSuccess: (_, { role, user }) => {
      invalidateUsers();
      refreshAuthUser();
      toast.success(`${user?.name} successfully given ${role} access`);
    },
    onError: () => {
      invalidateUsers();
      toast.error("Something went wrong");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ user, block }) =>
      adminService.updateUserStatus(
        user._id,
        block ? USER_STATUS.BLOCKED : USER_STATUS.ACTIVE
      ),
    onSuccess: (_, { user, block }) => {
      invalidateUsers();
      refreshAuthUser();
      toast.success(
        `${user?.name} successfully ${block ? "blocked" : "unblocked"}`
      );
    },
    onError: () => {
      invalidateUsers();
      toast.error("Something went wrong");
    },
  });

  const { exportToPDF } = useExportToPDF("tableDonation", "users.pdf");

  if (isError) return <QueryError onRetry={refetch} />;

  const ExportToPDF = async () => {
    if (allUserData?.users?.length < 1) {
      toast.error("No user record to export");
      return;
    }

    exportToPDF();
  };

  const SetProfileRole = (role, user) => {
    if (!role || !user) {
      return toast.error("Something went wrong");
    }

    Swal.fire({
      title: "Are you sure?",
      text: `Give ${role} access to ${user?.name}?`,
      icon: "question",
      confirmButtonText: `Give ${role} access`,
      showCancelButton: true,
    }).then((response) => {
      if (!response?.isConfirmed) {
        return;
      }
      roleMutation.mutate({ role, user });
    });
  };

  const BlockAndUnBlockUser = (user, block) => {
    Swal.fire({
      title: `${block ? "Block" : "Unblock"} ${user?.name}`,
      text: `Are you sure you want to ${block ? "block" : "unblock"} this user?`,
      showCancelButton: true,
      icon: "question",
    }).then((res) => {
      if (!res?.isConfirmed) {
        return;
      }
      statusMutation.mutate({ user, block });
    });
  };

  const renderRoleMenu = (user) => {
    if (user?.role === USER_ROLES.ADMIN) {
      return (
        <>
          <button
            className={MENU_ITEM_CLASS}
            onClick={() => SetProfileRole(USER_ROLES.DONOR, user)}
          >
            Make donor
          </button>
          <div className={MENU_DIVIDER} />
          <button
            className={MENU_ITEM_CLASS}
            onClick={() => SetProfileRole(USER_ROLES.VOLUNTEER, user)}
          >
            Make volunteer
          </button>
        </>
      );
    }
    if (user?.role === USER_ROLES.VOLUNTEER) {
      return (
        <>
          <button
            className={MENU_ITEM_CLASS}
            onClick={() => SetProfileRole(USER_ROLES.DONOR, user)}
          >
            Make donor
          </button>
          <div className={MENU_DIVIDER} />
          <button
            className={MENU_ITEM_CLASS}
            onClick={() => SetProfileRole(USER_ROLES.ADMIN, user)}
          >
            Make admin
          </button>
        </>
      );
    }
    return (
      <>
        <button
          className={MENU_ITEM_CLASS}
          onClick={() => SetProfileRole(USER_ROLES.VOLUNTEER, user)}
        >
          Make volunteer
        </button>
        <div className={MENU_DIVIDER} />
        <button
          className={MENU_ITEM_CLASS}
          onClick={() => SetProfileRole(USER_ROLES.ADMIN, user)}
        >
          Make admin
        </button>
      </>
    );
  };

  return (
    <>
      <Helmet>
        <title>All users | Red. Bank</title>
      </Helmet>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>All users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageTransition className="bg-white p-5 rounded-xl">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">All users</h2>
            <p className="text-sm text-neutral-500">
              {allUserData?.totalItems ?? 0} total users
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
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(1);
                  }
                }}
                placeholder="Search users..."
                aria-label="Search users"
                className="h-9 pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={filterByStatus}
                onValueChange={(value) => {
                  setfilterByStatus(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="group h-9 w-9 border border-neutral-200 text-neutral-600 hover:text-brand-600"
                onClick={() => {
                  setSearchInput("");
                  setfilterByStatus("all");
                  setCurrentPage(1);
                }}
                aria-label="Reset search and filters"
              >
                <RiResetRightFill
                  size={16}
                  className="group-hover:animate-spin"
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={ExportToPDF}
              >
                <PiPrinterThin size={16} />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
        <Table id="tableDonation" className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">User</TableHead>
              <TableHead className="w-[140px]">Role</TableHead>
              <TableHead className="w-[180px]">Status</TableHead>
              <TableHead className="w-[130px]">Blood group</TableHead>
              <TableHead className="text-right">Created at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUserData &&
              !isLoading &&
              allUserData?.users?.map((user, index) => (
                <React.Fragment key={user?._id || index}>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-2 ring-brand-100">
                          <AvatarImage src={user?.avatar} alt="" />
                          <AvatarFallback className="bg-brand-50 text-xs font-semibold text-brand-700">
                            {user?.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-neutral-900">
                            {user?.name}
                          </p>
                          <p className="truncate text-sm text-neutral-500">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Change role for ${user?.name}`}
                            className={cn(
                              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors hover:ring-2 hover:ring-offset-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                              ROLE_STYLES[user?.role] || ROLE_STYLES[USER_ROLES.DONOR]
                            )}
                          >
                            <span className="capitalize">{user?.role}</span>
                            <ChevronDown size={14} className="opacity-70" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-44 p-1"
                          align="end"
                        >
                          {renderRoleMenu(user)}
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            user?.status === USER_STATUS.ACTIVE
                              ? "success"
                              : "neutral"
                          }
                        >
                          {user?.status === USER_STATUS.ACTIVE
                            ? "Active"
                            : "Blocked"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={
                            user?.status === USER_STATUS.ACTIVE
                              ? "text-neutral-500 hover:text-brand-600"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }
                          onClick={() =>
                            BlockAndUnBlockUser(
                              user,
                              user?.status === USER_STATUS.ACTIVE
                            )
                          }
                          aria-label={`${
                            user?.status === USER_STATUS.ACTIVE
                              ? "Block"
                              : "Unblock"
                          } ${user?.name}`}
                        >
                          {user?.status === USER_STATUS.ACTIVE ? (
                            <Ban size={14} />
                          ) : (
                            <RotateCcw size={14} />
                          )}
                          {user?.status === USER_STATUS.ACTIVE
                            ? "Block"
                            : "Unblock"}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-neutral-700">
                      {user?.bloodGroup}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm text-neutral-500">
                      {moment(user?.createdAt).fromNow()}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            {isLoading &&
              [...Array(6)].map((_, index) => (
                <TableRow key={index}>
                  {[...Array(5)].map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {allUserData?.users?.length <= 0 && !isLoading && (
          <div className="py-10 text-center text-sm text-neutral-500">
            No users found
          </div>
        )}
        {!isLoading && (
          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={allUserData?.totalPages}
              onPageChange={setCurrentPage}
            />
            <p className="pb-2 text-center text-sm text-neutral-500">
              Showing {allUserData?.users?.length ?? 0} of{" "}
              {allUserData?.totalItems ?? 0} users
            </p>
          </div>
        )}
      </PageTransition>
    </>
  );
};

export default AllUser;