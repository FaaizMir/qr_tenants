"use client";
import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * AddressAutocomplete Component
 * 
 * Provides Google Maps-style autocomplete for address input using Geoapify API.
 * Returns complete location data including coordinates and map URLs.
 * 
 * @param {Object} props
 * @param {string} props.label - Label for the input field
 * @param {string} props.name - Name attribute for the input
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Current value
 * @param {Function} props.onChange - Callback when address is selected
 * @param {Object} props.errors - Form errors object
 * @param {boolean} props.required - Whether field is required
 */
const AddressAutocomplete = ({
    label = "Address",
    name = "address",
    placeholder = "Start typing an address...",
    value = "",
    onChange,
    errors,
    required = false,
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [error, setError] = useState(null);

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const debounceTimer = useRef(null);

    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

    // Sync with external value changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Fetch suggestions from Geoapify API
    const fetchSuggestions = async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        if (!apiKey) {
            setError("Geoapify API key is not configured");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
                    query
                )}&apiKey=${apiKey}&limit=5`
            );

            if (!response.ok) {
                // Get detailed error message from API
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `API Error: ${response.status} ${response.statusText}`;

                console.error("Geoapify API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });

                if (response.status === 401) {
                    throw new Error("Invalid API key. Please enable the Geocoding API in your Geoapify project settings.");
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            setSuggestions(data.features || []);
            setShowDropdown(true);
            setSelectedIndex(-1);
        } catch (err) {
            console.error("Error fetching suggestions:", err);
            setError(err.message || "Failed to load suggestions");
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced search
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(newValue);
        }, 500);
    };

    // Handle suggestion selection
    const handleSelectSuggestion = (suggestion) => {
        const properties = suggestion.properties;
        const coords = suggestion.geometry.coordinates;

        const formattedAddress = properties.formatted || properties.address_line1;
        const lat = coords[1]; // Geoapify returns [lon, lat]
        const lon = coords[0];

        // Generate map URLs
        const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

        // Update input value
        setInputValue(formattedAddress);
        setShowDropdown(false);
        setSuggestions([]);

        // Call onChange with complete location data
        if (onChange) {
            onChange({
                address: formattedAddress,
                latitude: lat,
                longitude: lon,
                mapUrl: osmUrl,
                googleMapsUrl: googleMapsUrl,
                placeId: properties.place_id,
                city: properties.city,
                country: properties.country,
                postcode: properties.postcode,
            });
        }
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelectSuggestion(suggestions[selectedIndex]);
                }
                break;
            case "Escape":
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !inputRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return (
        <div className="space-y-2">
            <Label htmlFor={name}>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="relative">
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        id={name}
                        name={name}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (suggestions.length > 0) {
                                setShowDropdown(true);
                            }
                        }}
                        placeholder={placeholder}
                        className={`pl-10 ${errors?.[name] ? "border-destructive" : ""}`}
                        autoComplete="off"
                    />
                    {isLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {showDropdown && suggestions.length > 0 && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto"
                    >
                        {suggestions.map((suggestion, index) => {
                            const properties = suggestion.properties;
                            const mainText = properties.formatted || properties.address_line1;
                            const secondaryText = [
                                properties.city,
                                properties.state,
                                properties.country,
                            ]
                                .filter(Boolean)
                                .join(", ");

                            return (
                                <div
                                    key={suggestion.properties.place_id || index}
                                    className={`px-4 py-3 cursor-pointer transition-colors ${index === selectedIndex
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent/50"
                                        }`}
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">
                                                {mainText}
                                            </div>
                                            {secondaryText && (
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {secondaryText}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* No results message */}
                {showDropdown && !isLoading && suggestions.length === 0 && inputValue.length >= 3 && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground"
                    >
                        No locations found
                    </div>
                )}
            </div>

            {/* Error message */}
            {(errors?.[name] || error) && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors?.[name]?.message || error}</span>
                </div>
            )}

            {/* API Key warning */}
            {!apiKey && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                        Geoapify API key not configured. Add NEXT_PUBLIC_GEOAPIFY_API_KEY to
                        .env.local
                    </span>
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;
