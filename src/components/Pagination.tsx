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
  if (totalCount === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between px-1 py-2 mt-2">
      <p className="text-xs text-slate-500">
        Showing {from}–{to} of {totalCount}
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
          ? "bg-zinc-100 text-zinc-950 font-bold border border-zinc-200"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800/80 disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-zinc-700"
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
