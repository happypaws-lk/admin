"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: PaginationProps) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between px-1 py-2 mt-2">
      <p className="text-xs text-slate-500">
        {totalCount > 0 ? `Showing ${from}–${to} of ${totalCount}` : "No results"}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-0.5">
          <PageBtn
            label="«"
            onClick={() => onPageChange(1)}
            disabled={!hasPreviousPage}
            title="First page"
          />
          <PageBtn
            label="‹"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPreviousPage}
            title="Previous page"
          />

          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-xs text-slate-600">
                …
              </span>
            ) : (
              <PageBtn
                key={p}
                label={String(p)}
                onClick={() => onPageChange(p as number)}
                active={p === page}
              />
            ),
          )}

          <PageBtn
            label="›"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            title="Next page"
          />
          <PageBtn
            label="»"
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            title="Last page"
          />
        </div>
      )}
    </div>
  );
}

function PageBtn({
  label,
  onClick,
  disabled = false,
  active = false,
  title,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
        active
          ? "bg-[#5b50e6] text-white"
          : "text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
      }`}
    >
      {label}
    </button>
  );
}

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}
