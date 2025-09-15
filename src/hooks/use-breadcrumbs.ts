// src/hooks/use-breadcrumbs.ts
import { useLocation } from "react-router-dom";
import { navData } from "@/lib/nav-data";
import { useMemo } from "react";

// Define a type for a single breadcrumb item
export interface BreadcrumbItem {
  title: string;
  url: string;
}

export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();
  const { pathname } = location;

  // useMemo will re-calculate the breadcrumbs only when the pathname changes
  const breadcrumbs = useMemo(() => {
    const pathSegments: BreadcrumbItem[] = [];

    // Handle the root dashboard case
    if (pathname === "/") {
      return [{ title: "Dashboard", url: "/" }];
    }

    // Check main navigation items
    for (const parent of navData.navMain) {
      if (parent.items) {
        for (const child of parent.items) {
          // Use startsWith for detail pages like /bookings/some-id
          if (pathname.startsWith(child.url) && child.url !== "/") {
            pathSegments.push({ title: parent.title, url: "#" });
            pathSegments.push({ title: child.title, url: child.url });
            return pathSegments;
          }
        }
      }
    }

    // You can add more loops here to check navData.projects or other sections if needed

    // If no match is found, create a fallback breadcrumb
    if (pathSegments.length === 0) {
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        const pageTitle = pathParts[pathParts.length - 1]
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        // Add a generic parent if applicable
        const parentTitle =
          pathParts.length > 1
            ? pathParts[0]
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())
            : "Home";

        const parentUrl = pathParts.length > 1 ? `/${pathParts[0]}` : "/";

        return [
          { title: parentTitle, url: parentUrl },
          { title: pageTitle, url: pathname },
        ];
      }
    }

    return pathSegments;
  }, [pathname]);

  return breadcrumbs;
};
