import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout/Layout";
import DashboardLayout from "../Layout/DashboardLayout";
import AuthLayout from "@/Layout/AuthLayout";
import PublicRoutes from "./Public.routes";
import PrivateRoutes from "./Private.routes";
import BlockedRoute from "./Blocked.routes";
import AdminRoutes from "./Admin.routes";
import Loader from "@/components/Loader";

const Home = lazy(() => import("@/pages/Home/Home"));
const Search = lazy(() => import("@/pages/Search"));
const Blogs = lazy(() => import("@/pages/Blog/Blogs"));
const BlogDetails = lazy(() => import("@/pages/Blog/BlogDetails"));
const DonationReq = lazy(() => import("@/pages/DonationReq"));
const Donation = lazy(() => import("@/pages/Donation"));
const Fund = lazy(() => import("@/pages/Fund"));
const Login = lazy(() => import("@/pages/Auth/Login"));
const Register = lazy(() => import("@/pages/Auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/Auth/ForgotPassword"));
const Root = lazy(() => import("@/pages/Dashboard/Root"));
const Profile = lazy(() => import("@/pages/Dashboard/Profile"));
const CreateDonationReq = lazy(() =>
  import("@/pages/Dashboard/Donor/CreateDonation")
);
const UpdateDonationReq = lazy(() =>
  import("@/pages/Dashboard/Donor/UpdateDonationReq")
);
const MyDonationsReq = lazy(() =>
  import("@/pages/Dashboard/Donor/MyDonationsReq")
);
const AllUsers = lazy(() => import("@/pages/Dashboard/Admin/AllUsers"));
const AllDonationsReq = lazy(() =>
  import("@/pages/Dashboard/Admin/AllDonationsReq")
);
const AddBlog = lazy(() => import("@/pages/Dashboard/ContentManage/AddBlog"));
const UpdateBlog = lazy(() =>
  import("@/pages/Dashboard/ContentManage/UpdateBlog")
);
const ContentManageRoot = lazy(() =>
  import("@/pages/Dashboard/ContentManage/ContentManageRoot")
);
const NotFound = lazy(() => import("@/pages/NotFound"));

const withLoader = (Component) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: withLoader(Home) },
      { path: "/donor/search", element: withLoader(Search) },
      { path: "/blogs", element: withLoader(Blogs) },
      { path: "/blogs/:id", element: withLoader(BlogDetails) },
      { path: "/donation-requests", element: withLoader(DonationReq) },
      {
        path: "/donation/:id",
        element: (
          <PrivateRoutes>{withLoader(Donation)}</PrivateRoutes>
        ),
      },
      {
        path: "/fundings",
        element: <PrivateRoutes>{withLoader(Fund)}</PrivateRoutes>,
      },
    ],
  },
  // Auth Layout
  {
    path: "/auth",
    element: (
      <PublicRoutes>
        <AuthLayout />
      </PublicRoutes>
    ),
    children: [
      { path: "login", element: withLoader(Login) },
      { path: "register", element: withLoader(Register) },
      { path: "forgot-password", element: withLoader(ForgotPassword) },
    ],
  },
  // Dashboard
  {
    path: "/dashboard",
    element: (
      <PrivateRoutes>
        <DashboardLayout />
      </PrivateRoutes>
    ),
    children: [
      { path: "", element: withLoader(Root) },
      {
        path: "create-donation-request",
        element: <BlockedRoute>{withLoader(CreateDonationReq)}</BlockedRoute>,
      },
      { path: "my-donation-request", element: <BlockedRoute>{withLoader(MyDonationsReq)}</BlockedRoute> },
      {
        path: "all-users",
        element: <AdminRoutes>{withLoader(AllUsers)}</AdminRoutes>,
      },
      {
        path: "all-blood-donation-request",
        element: (
          <AdminRoutes volunteer={true}>
            {withLoader(AllDonationsReq)}
          </AdminRoutes>
        ),
      },
      {
        path: "content-management",
        element: (
          <AdminRoutes volunteer={true}>
            {withLoader(ContentManageRoot)}
          </AdminRoutes>
        ),
      },
      {
        path: "content-management/add-blog",
        element: (
          <AdminRoutes volunteer={true}>{withLoader(AddBlog)}</AdminRoutes>
        ),
      },
      {
        path: "content-management/update-blog/:id",
        element: (
          <AdminRoutes volunteer={true}>{withLoader(UpdateBlog)}</AdminRoutes>
        ),
      },
      { path: "donation/edit/:id", element: <BlockedRoute>{withLoader(UpdateDonationReq)}</BlockedRoute> },
      { path: "profile", element: withLoader(Profile) },
    ],
  },
  // Not Found
  {
    path: "*",
    element: withLoader(NotFound),
  },
]);
