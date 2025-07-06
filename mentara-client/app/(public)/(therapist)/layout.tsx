import { ToastProvider } from "@/contexts/ToastContext";

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}