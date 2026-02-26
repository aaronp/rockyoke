// src/pages/OrderComplete.tsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { addTicketToStorage } from "@/hooks/useTickets";

export default function OrderComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = searchParams.get("oid");

    if (orderId) {
      addTicketToStorage(orderId);
    }

    // Redirect to home
    navigate("/", { replace: true });
  }, [searchParams, navigate]);

  // Brief loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-amber-100">
      <p>Processing your order...</p>
    </div>
  );
}
