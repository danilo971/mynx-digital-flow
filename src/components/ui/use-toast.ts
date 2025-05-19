
import * as React from "react";
import { toast } from "sonner";

export { toast };

export const useToast = () => {
  return {
    toast,
    // Add placeholder methods for compatibility with old toast references
    error: (message: string) => toast.error(message),
    success: (message: string) => toast.success(message),
    warning: (message: string) => toast.warning(message),
    toasts: []
  };
};
