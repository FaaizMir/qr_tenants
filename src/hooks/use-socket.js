"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";

export const useSocket = () => {
    const { data: session } = useSession();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!session?.access_token) return;

        // Prevent multiple connections
        if (socketRef.current) return;

        const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000", {
            auth: {
                token: session.access_token,
            },
            transports: ["websocket"],
        });

        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        socketInstance.on("error", (err) => {
            console.error("Socket error:", err);
        });

        socketRef.current = socketInstance;
        setSocket(socketInstance);

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
        };
    }, [session?.access_token]);

    return { socket, isConnected };
};
