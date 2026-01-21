import React from "react";
import { ChevronDown, Loader2, Check } from "lucide-react";

export default function BatchSelector({
    selectedId,
    batches,
    isOpen,
    setIsOpen,
    onSelect,
    loading,
    placeholder,
}) {
    const selectedBatch = batches.find((b) => b.id === selectedId);
    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all bg-background hover:bg-muted/20 ${isOpen ? "ring-2 ring-primary/10 border-primary" : "border-muted/60"
                    }`}
            >
                <div className="flex flex-col items-start overflow-hidden">
                    <span
                        className={`text-sm truncate w-full ${selectedId
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                            }`}
                    >
                        {selectedId
                            ? selectedBatch?.batch_name || `Batch #${selectedId}`
                            : placeholder}
                    </span>
                    {selectedBatch && (
                        <span className="text-[10px] text-muted-foreground">
                            {selectedBatch.issued_quantity || 0}/
                            {selectedBatch.total_quantity || 0} claimed
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-muted/30 bg-background/95 backdrop-blur-sm shadow-xl max-h-56 overflow-auto animate-in fade-in zoom-in-95 duration-200">
                    {loading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="py-3 px-4 text-xs text-muted-foreground text-center">
                            No batches found
                        </div>
                    ) : (
                        batches.map((batch) => (
                            <button
                                key={batch.id}
                                type="button"
                                onClick={() => {
                                    onSelect(batch.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-primary/5 transition-colors ${selectedId === batch.id ? "bg-primary/10" : ""
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <div className="font-medium text-sm truncate">
                                        {batch.batch_name}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground truncate">
                                        {batch.description || "No description"}
                                    </div>
                                </div>
                                {selectedId === batch.id && (
                                    <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
