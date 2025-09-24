// - - - src/components/comp-459.tsx (Recommended Update)
import { usePagination } from "@/hooks/use-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void; // <-- ADD THIS PROP
  paginationItemsToDisplay?: number;
};

// I'll rename it here for clarity, but you can keep your filename
export default function ServerPagination({
  currentPage,
  totalPages,
  onPageChange, // <-- DESTRUCTURE IT
  paginationItemsToDisplay = 5,
}: PaginationProps) {
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
  });

  // Helper to prevent default link behavior and call the callback
  const handlePageClick = (e: React.MouseEvent, page: number) => {
    e.preventDefault(); // Prevent URL from changing to #/page/...
    onPageChange(page);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => handlePageClick(e, currentPage - 1)}
            className="cursor-pointer" // Make it look clickable
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>

        {showLeftEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={(e) => handlePageClick(e, page)}
              className="cursor-pointer" // Make it look clickable
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {showRightEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={(e) => handlePageClick(e, currentPage + 1)}
            className="cursor-pointer" // Make it look clickable
            aria-disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
