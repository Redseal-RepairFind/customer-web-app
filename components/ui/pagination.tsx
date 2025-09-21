"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

type PaginationProps = {
  totalPages: number;
  currentPage: number;
};

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageLink = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    router.push(createPageLink(page));
  };

  if (totalPages <= 1) return null;

  const getPaginationRange = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      {getPaginationRange().map((page, i) =>
        page === "..." ? (
          <span key={i} className="px-3 py-1 select-none">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(Number(page))}
            className={`px-3 py-1 border rounded ${
              page === currentPage ? "bg-dark text-white" : ""
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
