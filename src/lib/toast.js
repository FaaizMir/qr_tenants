import { toast as sonnerToast } from "sonner";

const defaultOptions = {
    closeButton: true,
    duration: 1000,
};

export const toast = {
    success: (message, options = {}) =>
        sonnerToast.success(message, { ...defaultOptions, ...options }),
    error: (message, options = {}) =>
        sonnerToast.error(message, { ...defaultOptions, ...options }),
    info: (message, options = {}) =>
        sonnerToast.info(message, { ...defaultOptions, ...options }),
    warning: (message, options = {}) =>
        sonnerToast.warning(message, { ...defaultOptions, ...options }),
    promise: (promise, options = {}) =>
        sonnerToast.promise(promise, {
            ...options,
            success: (data) => ({
                ...(typeof options.success === 'function' ? options.success(data) : { message: options.success || 'Success' }),
                ...defaultOptions,
            }),
            error: (data) => ({
                ...(typeof options.error === 'function' ? options.error(data) : { message: options.error || 'Error' }),
                ...defaultOptions,
            }),
        }),
    custom: (message, options = {}) =>
        sonnerToast.custom(message, { ...defaultOptions, ...options }),
    dismiss: (id) => sonnerToast.dismiss(id),
    loading: (message, options = {}) => sonnerToast.loading(message, { ...defaultOptions, ...options }),
};
