// src/lib/nav-data.ts
import {
  User,
  LayoutGrid,
  ClipboardList,
  Table,
  FileText,
  MessageSquare,
  Ticket,
  Mail,
  PieChart,
  Layers,
  Lock,
} from "lucide-react";

export const navData = {
  user: {
    name: "Musharof",
    email: "musharof@example.com",
    avatar: "/avatars/shadcn.jpg", // Replace with a real avatar path
  },
  navMain: [
    { title: "User Profile", icon: User, url: "#" },
    {
      title: "Task",
      icon: ClipboardList,
      url: "#",
      items: [{ title: "Sub Task", url: "#" }],
    },
    {
      title: "Forms",
      icon: LayoutGrid,
      url: "#",
      items: [{ title: "Sub Form", url: "#" }],
    },
    {
      title: "Tables",
      icon: Table,
      url: "#",
      items: [{ title: "Sub Table", url: "#" }],
    },
    {
      title: "Pages",
      icon: FileText,
      url: "#",
      items: [{ title: "Sub Page", url: "#" }],
    },
  ],
  supportLinks: [
    { title: "Chat", icon: MessageSquare, url: "#" },
    { title: "Support Ticket", icon: Ticket, url: "#", tag: "NEW" },
    {
      title: "Email",
      icon: Mail,
      url: "#",
      items: [{ title: "Sub Email", url: "#" }],
    },
  ],
  otherLinks: [
    {
      title: "Charts",
      icon: PieChart,
      url: "#",
      items: [{ title: "Sub Chart", url: "#" }],
    },
    {
      title: "UI Elements",
      icon: Layers,
      url: "#",
      items: [{ title: "Sub Element", url: "#" }],
    },
    {
      title: "Authentication",
      icon: Lock,
      url: "#",
      items: [{ title: "Sub Auth", url: "#" }],
    },
  ],
};
