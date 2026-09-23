import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import MoveToInboxRoundedIcon from "@mui/icons-material/MoveToInboxRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import RvHookupRoundedIcon from "@mui/icons-material/RvHookupRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

export type SubItem = { title: string; href: string; badge?: number };
export type NavItem = {
  key: string;
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number;
  children?: SubItem[];
};

export const ADMIN_MENU: NavItem[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: <SpaceDashboardRoundedIcon />,
  },
  {
    key: "leads",
    title: "Leads",
    icon: <MoveToInboxRoundedIcon />,
    children: [
      { title: "Quote Requests", href: "/dashboard/leads/quotes", },
      { title: "Contact Messages", href: "/dashboard/leads/contact", },
      { title: "Newsletter", href: "/dashboard/leads/newsletter" },
    ],
  },
  {
    key: "services",
    title: "Services",
    icon: <LocalShippingRoundedIcon />,
    children: [
      { title: "Hot Shot", href: "/dashboard/services/hot-shot" },
      { title: "Box Truck", href: "/dashboard/services/box-truck" },
      { title: "Semi Truck", href: "/dashboard/services/semi-truck" },
    ],
  },
  {
    key: "faqs",
    title: "FAQs",
    href: "/dashboard/faqs",
    icon: <RvHookupRoundedIcon />,
  },
  {
    key: "teams",
    title: "Teams",
    href: "/dashboard/teams",
    icon: <RvHookupRoundedIcon />,
  },
  {
    key: "testimonials",
    title: "Testimonials",
    href: "/dashboard/testimonials",
    icon: <RvHookupRoundedIcon />,
  },
  {
    key: "rentals",
    title: "Rentals",
    href: "/dashboard/rentals",
    icon: <RvHookupRoundedIcon />,
  },
  {
    key: "blog",
    title: "Blog",
    icon: <ArticleRoundedIcon />,
    children: [
      { title: "Posts", href: "/dashboard/blog/posts" },
      { title: "Comments", href: "/dashboard/blog/comments", },
    ],
  },
  {
    key: "messages",
    title: "Messages",
    href: "/dashboard/messages",
    icon: <ChatRoundedIcon />,
  },
  {
    key: "settings",
    title: "Settings",
    href: "/dashboard/settings",
    icon: <SettingsRoundedIcon />,
  },
];
