import { toast } from "sonner";

export function notifyAction(message: string) {
  if (typeof window === "undefined") return;
  toast.success(message);
}

export function notifyError(message: string) {
  if (typeof window === "undefined") return;
  toast.error(message);
}

export function notifyInfo(message: string) {
  if (typeof window === "undefined") return;
  toast(message);
}
