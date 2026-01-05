import React, { useState } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRIZES = [
    { id: 1, name: "10% OFF", probability: 0.4 },
    { id: 2, name: "Free Drink", probability: 0.3 },
    { id: 3, name: "Buy 1 Get 1", probability: 0.2 },
    { id: 4, name: "Mystery Gift", probability: 0.1 },
];

export const LuckyDraw = ({ nextStep, setReward }) => {
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);

    const handleSpin = () => {
        setSpinning(true);
        // Simulate spin delay
        setTimeout(() => {
            const prize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
            setResult(prize);
            setSpinning(false);
            setReward(prize);
            // Delay to show success
            setTimeout(() => nextStep(), 1500);
        }, 3000);
    };

    if (result) {
        return (
            <div className="text-center space-y-6 py-10 animate-in zoom-in duration-500">
                <div className="mb-6 relative">
                    <Trophy className="w-24 h-24 mx-auto text-yellow-500 animate-bounce" />
                    <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
                </div>
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-yellow-500 to-orange-500">
                    YOU WON!
                </h2>
                <p className="text-2xl font-bold text-foreground">{result.name}</p>
            </div>
        );
    }

    return (
        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-600">
                    Lucky Draw
                </h2>
                <p className="text-muted-foreground">Spin the wheel to win a prize!</p>
            </div>

            <div className="relative w-64 h-64 mx-auto my-8">
                {/* Simple CSS Wheel Visualization */}
                <div
                    className={cn(
                        "w-full h-full rounded-full border-8 border-primary/20 relative overflow-hidden transition-transform duration-3000 ease-out",
                        spinning && "rotate-1080"
                    )}
                    style={{
                        background:
                            "conic-gradient(from 0deg, #ff8b8b 0deg 90deg, #8ba8ff 90deg 180deg, #8bffc5 180deg 270deg, #fff78b 270deg 360deg)",
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-white shadow-lg z-10"></div>
                    </div>
                </div>
                {/* Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 z-20">
                    <div className="w-0 h-0 border-l-10 border-l-transparent border-t-20 border-t-primary border-r-10 border-r-transparent"></div>
                </div>
            </div>

            <Button
                size="lg"
                onClick={handleSpin}
                disabled={spinning}
                className="w-full h-14 text-xl font-bold bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-xl"
            >
                {spinning ? "Spinning..." : "SPIN NOW!"}
            </Button>
        </div>
    );
};
