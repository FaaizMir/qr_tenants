import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

export default function StickySaveBar({ loading, onSave }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white/80 backdrop-blur-md z-50 flex items-center justify-between gap-4 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)] lg:pl-96">
            <div className="container max-w-7xl mx-auto flex items-center justify-between">
                <div className="items-center gap-2 text-muted-foreground hidden sm:flex">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm">Changes apply immediately upon save</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                        variant="ghost"
                        onClick={() => window.location.reload()}
                        className="hidden sm:flex"
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={loading}
                        size="lg"
                        className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                                Changes...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Save All Settings
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
