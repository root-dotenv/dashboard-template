// src/pages/placeholder-page.tsx
import { Card } from "@/components/ui/card";
import { useLocation } from "react-router-dom";

export default function PlaceholderPage() {
  const location = useLocation();

  // Create a user-friendly title from the pathname
  const title =
    location.pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()) || "Page";

  return (
    <Card>
      <h1 className="text-3xl font-medium text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-500">
        This is a placeholder page for the route:
        <code className="ml-2 bg-gray-100 text-red-500 p-1 rounded">
          {location.pathname}
        </code>
      </p>
    </Card>
  );
}
