import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export function DataTablePagination({
  table,
  page,
  setPage,
  pageSize,
  setPageSize,
  total,
}) {
  const t = useTranslations("common.table");
  let totalPages = Math.ceil(total / pageSize) || 1;
  return (
    <div className="flex items-center justify-between px-2 mb-10">
      <div className="hidden sm:flex text-muted-foreground flex-1 text-sm">
        {t("rowsSelected", {
          selected: table?.getFilteredSelectedRowModel?.()?.rows.length ?? 0,
          total: table?.getFilteredRowModel?.()?.rows.length ?? 0,
        })}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="hidden sm:flex text-sm font-medium">{t("rowsPerPage")}</p>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(0);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {t("page", { current: page + 1, total: totalPages })}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => setPage(0)}
            disabled={page === 0}
          >
            <span className="sr-only">{t("goToFirstPage")}</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            <span className="sr-only">{t("goToPreviousPage")}</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setPage(page + 1)}
            disabled={page + 1 >= totalPages}
          >
            <span className="sr-only">{t("goToNextPage")}</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => setPage(totalPages - 1)}
            disabled={page + 1 >= totalPages}
          >
            <span className="sr-only">{t("goToLastPage")}</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

