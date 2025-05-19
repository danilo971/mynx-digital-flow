
import * as React from "react";
import { toast } from "sonner";

// Type definitions to properly handle toast variants
type ToastType = {
  (props: any): { id: string; dismiss: () => void; update: (props: any) => void };
  error: (message: string) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
};

// Export the enhanced toast
export { toast as Toast };
export { toast };

export const useToast = () => {
  return {
    toast: toast as ToastType,
    // Add placeholder methods for compatibility with old toast references
    error: (message: string) => toast.error(message),
    success: (message: string) => toast.success(message),
    warning: (message: string) => toast.warning(message),
    toasts: []
  };
};
