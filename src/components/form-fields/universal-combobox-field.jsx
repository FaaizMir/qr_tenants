"use client";

import React, { useState, useEffect, useRef } from "react";

function getNestedValue(obj, key) {
  if (!obj || !key) return "";
  return key.split(".").reduce((acc, k) => acc && acc[k], obj);
}
import { Controller } from "react-hook-form";
import axiosInstance from "@/lib/axios";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function UniversalComboBoxField({
  label = "",
  name = "",
  control,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  errors,
  validation = {},
  className = "",
  disabled = false,
  selectedItem,
  setSelectedItem,
  dataToStore,
  apiEndpoint,
  valueKey = "id",
  labelKey = "name",
  searchParam = "search",
  params,
  multipleValues = false,
  additionalValueKeys = [],
  ...props
}) {
  const comboBoxParams = params ? { ...params } : {};

  return (
    <div className={"mb-4 w-full " + className}>
      {label && (
        <label
          htmlFor={name}
          className="block mb-1 font-medium text-sm text-black">
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={validation}
        render={({ field }) => (
          <UniversalComboBoxInput
            value={field.value}
            onChange={field.onChange}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
            disabled={disabled}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            dataToStore={dataToStore}
            apiEndpoint={apiEndpoint}
            valueKey={valueKey}
            labelKey={labelKey}
            searchParam={searchParam}
            params={comboBoxParams}
            multipleValues={multipleValues}
            additionalValueKeys={additionalValueKeys}
            {...props}
          />
        )}
      />
      {errors && errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
}

function UniversalComboBoxInput({
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  selectedItem,
  setSelectedItem,
  apiEndpoint,
  valueKey,
  dataToStore,
  labelKey,
  searchParam,
  params,
  multipleValues,
  additionalValueKeys,
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axiosInstance(apiEndpoint, {
      params: {
        ...(params || {}),
        [searchParam]: debouncedSearch || "",
        page: 1,
        pageSize: 10,
      },
    })
      .then((response) => {
        let data = [];
        if (dataToStore) {
          data =
            response.data[dataToStore] ||
            response.data?.[dataToStore] ||
            response.data.data?.[dataToStore] ||
            response.data.data?.[dataToStore] ||
            [];
        } else {
          data = response.data.data || response.data || [];
        }
        if (Array.isArray(data)) {
          const mappedOptions = data.map((item) => ({
            value: item[valueKey] ?? "",
            label: getNestedValue(item, labelKey) ?? "",
            rawData: item,
          }));
          setOptions(mappedOptions);
        } else {
          setOptions([]);
        }
      })
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
  }, [
    debouncedSearch,
    open,
    apiEndpoint,
    valueKey,
    labelKey,
    searchParam,
    params,
    dataToStore,
  ]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [options, open]);

  useEffect(() => {
    if (!open && value && !options.find((opt) => opt.value === value)) {
      axiosInstance(`${apiEndpoint}/${value}`)
        .then((response) => {
          let item = null;
          if (dataToStore) {
            item =
              response.data[dataToStore] ||
              response.data.data?.[dataToStore] ||
              response.data.data?.[dataToStore];
          } else {
            item = response.data.data || response.data;
          }
          if (item && item[valueKey]) {
            setOptions((prev) => [
              { value: item[valueKey], label: getNestedValue(item, labelKey) },
              ...prev,
            ]);
          }
        })
        .catch(() => {});
    }
  }, [value, open, options, apiEndpoint, valueKey, labelKey, dataToStore]);

  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  useEffect(() => {
    if (!open) setHighlightedIdx(-1);
    else setHighlightedIdx(0);
  }, [open, options]);

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      setHighlightedIdx((idx) => Math.min(idx + 1, options.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIdx((idx) => Math.max(idx - 1, 0));
      e.preventDefault();
    } else if (
      e.key === "Enter" &&
      highlightedIdx >= 0 &&
      options[highlightedIdx]
    ) {
      selectOption(options[highlightedIdx]);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function selectOption(option) {
    if (!option) return;

    if (multipleValues && additionalValueKeys.length > 0) {
      const multipleData = {
        [valueKey]: option.value,
        [labelKey]: option.label,
      };
      additionalValueKeys.forEach((key) => {
        multipleData[key] = option.rawData[key];
      });
      onChange(multipleData);
      if (setSelectedItem) setSelectedItem(multipleData);
    } else {
      // Existing behavior for backward compatibility
      onChange(option.value);
      if (setSelectedItem)
        setSelectedItem({ [valueKey]: option.value, [labelKey]: option.label });
    }

    setOpen(false);
    setSearch("");
  }

  let selectedOption = options.find(
    (opt) =>
      String(opt.value) ===
      String(multipleValues ? value && value[valueKey] : value)
  );

  if (!selectedOption && selectedItem && selectedItem[valueKey]) {
    const id = selectedItem[valueKey];
    const name = getNestedValue(selectedItem, labelKey);
    selectedOption = { value: id, label: name };
    if (!options.find((opt) => String(opt.value) === String(id))) {
      setOptions((prev) => [{ value: id, label: name }, ...prev]);
    }
  }

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (open && listRef.current && highlightedIdx >= 0) {
      const el = listRef.current.children[highlightedIdx];
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIdx, open]);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        className={`w-full border rounded-sm px-3 py-[5px] text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}>
        <span className={selectedOption ? "" : "text-black"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className="w-4 h-4 ml-2 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-x-hidden  overflow-y-auto ">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
          <ul
            ref={listRef}
            tabIndex={-1}
            role="listbox"
            className="max-h-40 overflow-auto text-sm">
            {loading ? (
              <li className="py-2 px-3 text-gray-500">Loading...</li>
            ) : options.length === 0 ? (
              <li className="py-2 px-3 text-gray-500">{emptyMessage}</li>
            ) : (
              options.map((option, idx) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  className={`cursor-pointer px-3 py-2 flex items-center justify-between hover:bg-blue-100 ${
                    idx === highlightedIdx ? "bg-blue-100" : ""
                  } ${
                    (multipleValues ? value && value[valueKey] : value) ===
                    option.value
                      ? "font-semibold text-blue-700"
                      : ""
                  }`}
                  onMouseDown={() => selectOption(option)}
                  onMouseEnter={() => setHighlightedIdx(idx)}>
                  <span>{option.label}</span>
                  {(multipleValues ? value && value[valueKey] : value) ===
                    option.value && (
                    <svg
                      className="w-4 h-4 text-blue-500 ml-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
