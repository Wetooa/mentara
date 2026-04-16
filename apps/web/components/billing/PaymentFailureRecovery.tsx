"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CreditCard,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// import { PaymentMethodForm } from "./PaymentMethodForm";

// Use the actual Invoice type that matches our data structure
type FailedPayment = {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: "pending" | "cancelled" | "failed" | "paid";
  createdAt: string;
  userId: string;
  sessionId?: string;
  paidAt?: string;
  canRetry?: boolean;
  retryCount?: number;
};

interface PaymentFailureRecoveryProps {
  userId: string;
  onPaymentResolved?: () => void;
}

export function PaymentFailureRecovery({
  userId,
  onPaymentResolved,
}: PaymentFailureRecoveryProps) {
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [retryingPayments, setRetryingPayments] = useState<Set<string>>(new Set());

  const api = useApi();
  const queryClient = useQueryClient();

  // Get failed payments (using invoices with failed status)
  const { data: failedPayments = [], isLoading } = useQuery({
    queryKey: ["failed-payments", userId],
    queryFn: async () => {
      // Use the actual invoices API and filter for failed payments
      const invoices = await api.billing.getInvoices();
      return invoices.filter((invoice: FailedPayment) => invoice.status === "failed");
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["payment-methods", userId],
    queryFn: () => api.billing.getPaymentMethods(),
  });

  // Retry payment mutation
  const retryPaymentMutation = useMutation({
    mutationFn: async ({ paymentId, paymentMethodId }: { 
      paymentId: string; 
      paymentMethodId?: string;
    }) => {
      // Use payInvoice instead since retryPayment doesn't exist
      return api.billing.payInvoice(paymentId, paymentMethodId);
    },
    onMutate: ({ paymentId }) => {
      setRetryingPayments(prev => new Set(prev).add(paymentId));
    },
    onSuccess: () => {
      toast.success("Payment retry initiated successfully!");
      queryClient.invalidateQueries({ queryKey: ["failed-payments"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      onPaymentResolved?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to retry payment");
    },
    onSettled: (data, error, variables) => {
      setRetryingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.paymentId);
        return newSet;
      });
    },
  });

  const getFailureReasonDisplay = (reason: string) => {
    const reasonMap: Record<string, { text: string; color: string }> = {
      insufficient_funds: { text: "Insufficient Funds", color: "destructive" },
      card_declined: { text: "Card Declined", color: "destructive" },
      expired_card: { text: "Card Expired", color: "secondary" },
      processing_error: { text: "Processing Error", color: "secondary" },
      network_error: { text: "Network Error", color: "secondary" },
      authentication_required: { text: "Authentication Required", color: "destructive" },
    };

    return reasonMap[reason] || { text: reason, color: "secondary" };
  };

  const handleRetryPayment = (payment: FailedPayment, paymentMethodId?: string) => {
    retryPaymentMutation.mutate({
      paymentId: payment.id,
      paymentMethodId,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading payment status...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (failedPayments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="font-medium">All payments are up to date</h3>
              <p className="text-sm text-muted-foreground">
                No failed payments requiring attention
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Payment Issues Detected</strong> - {failedPayments.length} payment
          {failedPayments.length > 1 ? "s" : ""} require attention to continue your services.
        </AlertDescription>
      </Alert>

      {failedPayments.map((payment: FailedPayment) => {
        const failureReason = getFailureReasonDisplay("payment_failed");
        const isRetrying = retryingPayments.has(payment.id);

        return (
          <Card key={payment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  Failed Payment
                </CardTitle>
                <Badge variant={failureReason.color as "default" | "secondary" | "destructive" | "outline"}>
                  {failureReason.text}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <div className="font-medium">
                    ${payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Failed:</span>
                  <div className="font-medium">
                    {new Date(payment.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Description:</span>
                  <div className="font-medium">{payment.description}</div>
                </div>
                {payment.sessionId && (
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 text-amber-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        This payment is for an upcoming therapy session
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(payment.canRetry !== false) && (
                  <Button
                    onClick={() => handleRetryPayment(payment)}
                    disabled={isRetrying}
                    size="sm"
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Payment
                      </>
                    )}
                  </Button>
                )}

                {paymentMethods.length > 1 && (
                  <div className="flex gap-2">
                    {paymentMethods
                      .filter((pm) => !pm.isDefault)
                      .slice(0, 2)
                      .map((pm) => (
                        <Button
                          key={pm.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetryPayment(payment, pm.id)}
                          disabled={isRetrying}
                        >
                          Try {pm.brand?.toUpperCase()} ****{pm.last4}
                        </Button>
                      ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPaymentMethod(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add New Payment Method
                </Button>
              </div>

              {(payment.retryCount || 0) > 0 && (
                <div className="text-sm text-muted-foreground">
                  Previous retry attempts: {payment.retryCount}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {showAddPaymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center text-muted-foreground">
              Payment method form would go here (requires Stripe setup)
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowAddPaymentMethod(false)}>Close</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Need Help?</h4>
          <p className="text-sm text-muted-foreground">
            If you continue to experience payment issues, please contact our support team.
            We&apos;re here to help resolve any billing problems quickly.
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}