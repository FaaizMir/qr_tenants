"use client";

import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const useSocket = () => {
    const { data: session } = useSession();
    const socketRef = useRef(null);

    useEffect(() => {
        const token = session?.accessToken || session?.access_token;

        if (token && !socketRef.current) {
            console.log('Attempting socket connection with token snippet:', token.substring(0, 10) + '...');

            const cleanToken = token.trim();

            socketRef.current = io(SOCKET_URL, {
                auth: {
                    token: cleanToken,
                    // Fallback for different backend guard configurations
                    Authorization: `Bearer ${cleanToken}`
                },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                transports: ['websocket', 'polling']
            });

            socketRef.current.on('connect', () => {
                console.log('Socket successfully connected:', socketRef.current.id);
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error details:', error);
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [session]);

    const emit = useCallback((event, data) => {
        if (socketRef.current) {
            socketRef.current.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot emit:', event);
        }
    }, []);

    const on = useCallback((event, callback) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off(event, callback);
            }
        };
    }, []);

    const off = useCallback((event, callback) => {
        if (socketRef.current) {
            socketRef.current.off(event, callback);
        }
    }, []);

    return {
        socket: socketRef.current,
        emit,
        on,
        off,
        isConnected: !!socketRef.current?.connected
    };
};
