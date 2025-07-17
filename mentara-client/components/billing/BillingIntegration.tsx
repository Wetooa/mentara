"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useSubscriptionStatus,
  usePaymentMethods,
  useBillingSummary,
  useInvoices,
  usePayInvoice,
  useCreatePortalSession
} from "@/hooks/billing";
import { PaymentMethodForm } from "./PaymentMethodForm";
import { SubscriptionUpgrade } from "./SubscriptionUpgrade";
import { format, isAfter, isBefore, addDays } from "date-fns";

interface BillingIntegrationProps {
  compactMode?: boolean;
  className?: string;
}

export function BillingIntegration({
  compactMode = false,
  className
}: BillingIntegrationProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const {
    subscription,
    isActive,
    isPastDue,
    willCancel,
    hasPaymentIssue,
    isLoading: subscriptionLoading
  } = useSubscriptionStatus();

  const { } = usePaymentMethods();
  const { } = useInvoices({ limit: 5 });
  
  const {
    defaultPaymentMethod,
    unpaidInvoices,
    hasUnpaidInvoices,
    totalUnpaid
  } = useBillingSummary();

  const payInvoiceMutation = usePayInvoice();
  const createPortalSessionMutation = useCreatePortalSession();

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount / 100);
  };

  const getSubscriptionHealthScore = () => {
    let score = 100;
    
    if (isPastDue) score -= 40;
    if (hasUnpaidInvoices) score -= 30;
    if (!defaultPaymentMethod) score -= 20;
    if (willCancel) score -= 10;
    
    return Math.max(0, score);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const handlePayInvoice = async (invoiceId: string) => {
    if (!defaultPaymentMethod) {
      toast.error("Please add a payment method first");
      setShowPaymentForm(true);
      return;
    }

    try {
      await payInvoiceMutation.mutateAsync({
        invoiceId,
        paymentMethodId: defaultPaymentMethod.id,
      });
    } catch {
      // Error handled in mutation
    }
  };

  const handleOpenPortal = async () => {
    try {
      const returnUrl = window.location.href;
      await createPortalSessionMutation.mutateAsync(returnUrl);
    } catch {
      // Error handled in mutation
    }
  };

  const isTrialEnding = () => {
    if (!subscription?.trial_end) return false;
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);
    
    return isAfter(trialEnd, now) && isBefore(trialEnd, threeDaysFromNow);
  };

  const getDaysUntilTrialEnd = () => {
    if (!subscription?.trial_end) return 0;
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    return Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const healthScore = getSubscriptionHealthScore();

  if (compactMode) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Compact Status Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                hasPaymentIssue ? "bg-red-100" : isActive ? "bg-green-100" : "bg-gray-100"
              )}>
                {hasPaymentIssue ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : isActive ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {subscription ? subscription.plan.name : "No subscription"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasUnpaidInvoices && `${formatCurrency(totalUnpaid)} overdue`}
                  {isActive && !hasUnpaidInvoices && "Active"}
                  {!isActive && !hasUnpaidInvoices && "Inactive"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={hasPaymentIssue ? "destructive" : "secondary"} className="text-xs">
                {getHealthScoreLabel(healthScore)}
              </Badge>
              {hasPaymentIssue && (
                <Button size="sm" onClick={() => setShowPaymentForm(true)}>
                  Fix
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Action Forms */}
        {showPaymentForm && (
          <PaymentMethodForm
            onSuccess={() => setShowPaymentForm(false)}
            onCancel={() => setShowPaymentForm(false)}
            setAsDefault={!defaultPaymentMethod}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Billing Health Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Billing Health
            </span>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-medium", getHealthScoreColor(healthScore))}>
                {getHealthScoreLabel(healthScore)}
              </span>
              <span className="text-sm text-muted-foreground">({healthScore}/100)</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={healthScore} className="h-2" />
            
            <div className="grid gap-4 md:grid-cols-3">
              {/* Subscription Status */}
              <div className="text-center p-3 rounded-lg border">
                {subscriptionLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                ) : (
                  <>
                    {isActive ? (
                      <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    )}
                  </>
                )}
                <p className="font-medium text-sm">Subscription</p>
                <p className="text-xs text-muted-foreground">
                  {subscription ? subscription.plan.name : "No active plan"}
                </p>
              </div>

              {/* Payment Method */}
              <div className="text-center p-3 rounded-lg border">
                {defaultPaymentMethod ? (
                  <CreditCard className="h-6 w-6 text-green-500 mx-auto mb-2" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                )}
                <p className="font-medium text-sm">Payment Method</p>
                <p className="text-xs text-muted-foreground">
                  {defaultPaymentMethod 
                    ? `****${defaultPaymentMethod.card?.last4 || defaultPaymentMethod.bank_account?.last4}`
                    : "No default method"
                  }
                </p>
              </div>

              {/* Outstanding Balance */}
              <div className="text-center p-3 rounded-lg border">
                {hasUnpaidInvoices ? (
                  <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                )}
                <p className="font-medium text-sm">Balance</p>
                <p className="text-xs text-muted-foreground">
                  {hasUnpaidInvoices ? formatCurrency(totalUnpaid) : "All paid up"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      <AnimatePresence>
        {/* Trial Ending Alert */}
        {isTrialEnding() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert className="border-yellow-200 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Trial ending soon!</strong> Your trial ends in {getDaysUntilTrialEnd()} days.
                    Add a payment method to continue your subscription.
                  </div>
                  <Button size="sm" onClick={() => setShowPaymentForm(true)}>
                    Add Payment Method
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Past Due Alert */}
        {isPastDue && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Payment past due!</strong> Please update your payment method or pay outstanding invoices.
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowPaymentForm(true)}>
                      Update Payment
                    </Button>
                    <Button size="sm" onClick={handleOpenPortal}>
                      Pay Now
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Cancellation Warning */}
        {willCancel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert className="border-yellow-200 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    Your subscription will end on{" "}
                    {subscription?.current_period_end &&
                      format(new Date(subscription.current_period_end), "MMMM d, yyyy")}.
                  </div>
                  <Button size="sm" onClick={() => setShowUpgradeModal(true)}>
                    Reactivate
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unpaid Invoices */}
      {hasUnpaidInvoices && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Unpaid Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unpaidInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
                >
                  <div>
                    <p className="font-medium">Invoice #{invoice.number}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {invoice.due_date && format(new Date(invoice.due_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-red-600">
                      {formatCurrency(invoice.amount_due, invoice.currency)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handlePayInvoice(invoice.id)}
                      disabled={payInvoiceMutation.isPending}
                    >
                      {payInvoiceMutation.isPending ? "Processing..." : "Pay Now"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => setShowUpgradeModal(true)}
            >
              <div className="text-left">
                <div className="font-medium">Manage Plan</div>
                <div className="text-sm text-muted-foreground">Upgrade or change</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => setShowPaymentForm(true)}
            >
              <div className="text-left">
                <div className="font-medium">Payment Methods</div>
                <div className="text-sm text-muted-foreground">Add or update</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={handleOpenPortal}
              disabled={createPortalSessionMutation.isPending}
            >
              <div className="text-left">
                <div className="font-medium">Billing Portal</div>
                <div className="text-sm text-muted-foreground">Full management</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => window.open("/help/billing", "_blank")}
            >
              <div className="text-left">
                <div className="font-medium">Help & Support</div>
                <div className="text-sm text-muted-foreground">Get assistance</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PaymentMethodForm
              onSuccess={() => {
                setShowPaymentForm(false);
                toast.success("Payment method added successfully!");
              }}
              onCancel={() => setShowPaymentForm(false)}
              setAsDefault={!defaultPaymentMethod}
            />
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <SubscriptionUpgrade
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          selectedPlanId={subscription?.plan.id}
        />
      )}
    </div>
  );
}