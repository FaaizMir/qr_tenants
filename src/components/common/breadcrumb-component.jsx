"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { getTextDirection } from "@/i18n/routing";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export const BreadcrumbComponent = ({ data }) => {
  const locale = useLocale();
  const direction = getTextDirection(locale);
  const isRTL = direction === "rtl";
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const t = useTranslations("common");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <div className="flex items-center">
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">
              {t("home")}
            </BreadcrumbLink>
            {data?.length && (
              <ChevronIcon size={18} className="text-orange-500 " />
            )}
          </BreadcrumbItem>
        </div>
        {data?.length &&
          data.map((item, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                <Link
                  href={item.url}
                  className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">
                  {item.name}
                </Link>
                {index !== data.length - 1 && (
                  <ChevronIcon size={18} className="text-orange-500 mx-2" />
                )}
              </BreadcrumbItem>
            </div>
          ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
