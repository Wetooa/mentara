"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Star,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Calculator,
  Zap,
  Shield,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useSubscriptionPlans,
  useSubscriptionStatus,
  useUpdateSubscription,
  useSubscriptionPreview,
  useCreateSubscription
} from "@/hooks/billing";
import { format } from "date-fns";

interface SubscriptionUpgradeProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
}

const PLAN_FEATURES = {
  basic: [
    "Up to 2 therapy sessions per month",
    "Basic messaging with therapist",
    "Access to community forums",
    "Mental health assessments",
    "Basic worksheets library"
  ],
  pro: [
    "Up to 8 therapy sessions per month",
    "Unlimited messaging with therapist",
    "Priority community support",
    "Advanced mental health tracking",
    "Full worksheets library",
    "Video session recordings",
    "Crisis support priority",
    "Custom goal setting"
  ],
  premium: [
    "Unlimited therapy sessions",
    "24/7 crisis support hotline",
    "Multiple therapist assignments",
    "Advanced analytics dashboard",
    "Family therapy sessions",
    "Personalized treatment plans",
    "Direct psychiatrist consultations",
    "Premium community access",
    "All features included"
  ]
};

const PLAN_ICONS = {
  basic: Shield,
  pro: Zap,
  premium: Crown
};

export function SubscriptionUpgrade({
  isOpen,
  onClose,
  selectedPlanId
}: SubscriptionUpgradeProps) {
  const [selectedPlan, setSelectedPlan] = useState(selectedPlanId || "");
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [prorationOption, setProrationOption] = useState<"create_prorations" | "none">("create_prorations");
  const [showPreview, setShowPreview] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { subscription } = useSubscriptionStatus();
  const updateSubscriptionMutation = useUpdateSubscription();
  const createSubscriptionMutation = useCreateSubscription();
  const previewMutation = useSubscriptionPreview();

  const filteredPlans = plans?.filter(plan => plan.interval === billingInterval) || [];
  const currentPlan = subscription?.plan;
  const selectedPlanData = filteredPlans.find(plan => plan.id === selectedPlan);

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount / 100);
  };

  const isUpgrade = () => {
    if (!currentPlan || !selectedPlanData) return false;
    return selectedPlanData.price > currentPlan.price;
  };

  const isDowngrade = () => {
    if (!currentPlan || !selectedPlanData) return false;
    return selectedPlanData.price < currentPlan.price;
  };

  const getChangeType = () => {
    if (isUpgrade()) return "upgrade";
    if (isDowngrade()) return "downgrade";
    return "change";
  };

  const handlePreview = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    try {
      await previewMutation.mutateAsync({
        planId: selectedPlan,
        prorationBehavior: prorationOption,
      });
      setShowPreview(true);
    } catch {
      // Error handled in mutation
    }
  };

  const handleConfirmChange = async () => {
    if (!selectedPlan) return;

    setIsConfirming(true);
    try {
      if (subscription) {
        // Update existing subscription
        await updateSubscriptionMutation.mutateAsync({
          planId: selectedPlan,
          prorationBehavior: prorationOption,
        });
      } else {
        // Create new subscription
        await createSubscriptionMutation.mutateAsync({
          planId: selectedPlan,
        });
      }
      
      onClose();
    } catch {
      // Error handled in mutations
    } finally {
      setIsConfirming(false);
    }
  };

  const getYearlySavings = (monthlyPrice: number) => {
    const yearlyPlan = plans?.find(plan => 
      plan.interval === "year" && 
      plans.find(p => p.interval === "month" && Math.abs(p.price - monthlyPrice) < 100)
    );
    
    if (!yearlyPlan) return 0;
    
    const monthlyTotal = monthlyPrice * 12;
    const yearlySavings = monthlyTotal - yearlyPlan.price;
    return Math.round((yearlySavings / monthlyTotal) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            {subscription ? "Upgrade Your Subscription" : "Choose Your Plan"}
          </DialogTitle>
          <DialogDescription>
            {subscription 
              ? "Change your subscription plan to better fit your needs"
              : "Select a plan that works best for your mental health journey"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Plan Info */}
          {currentPlan && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You&apos;re currently on the <strong>{currentPlan.name}</strong> plan 
                ({formatCurrency(currentPlan.price)} per {currentPlan.interval})
              </AlertDescription>
            </Alert>
          )}

          {/* Billing Interval Toggle */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4 p-1 bg-muted rounded-lg">
              <Button
                variant={billingInterval === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingInterval("month")}
              >
                Monthly
              </Button>
              <Button
                variant={billingInterval === "year" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingInterval("year")}
                className="relative"
              >
                Yearly
                <Badge className="ml-2 bg-green-500 text-white">Save 20%</Badge>
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          {plansLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
              <div className="grid gap-6 md:grid-cols-3">
                {filteredPlans.map((plan) => {
                  const IconComponent = PLAN_ICONS[plan.name.toLowerCase() as keyof typeof PLAN_ICONS] || Star;
                  const isCurrentPlan = currentPlan?.id === plan.id;
                  const yearlySavings = billingInterval === "year" ? getYearlySavings(plan.price) : 0;
                  
                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className={cn(
                        "relative cursor-pointer transition-all hover:shadow-lg",
                        selectedPlan === plan.id && "ring-2 ring-primary",
                        plan.is_popular && "border-primary",
                        isCurrentPlan && "bg-primary/5"
                      )}>
                        <Label htmlFor={plan.id} className="cursor-pointer">
                          <RadioGroupItem
                            value={plan.id}
                            id={plan.id}
                            className="absolute top-4 right-4"
                          />
                          
                          {/* Popular Badge */}
                          {plan.is_popular && (
                            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                              Most Popular
                            </Badge>
                          )}

                          {/* Current Plan Badge */}
                          {isCurrentPlan && (
                            <Badge className="absolute top-4 left-4 bg-green-500">
                              Current Plan
                            </Badge>
                          )}

                          <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                              <IconComponent className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <div className="space-y-1">
                              <div className="text-3xl font-bold">
                                {formatCurrency(plan.price)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                per {plan.interval}
                                {yearlySavings > 0 && (
                                  <span className="block text-green-600 font-medium">
                                    Save {yearlySavings}% yearly
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {plan.description}
                            </p>
                          </CardHeader>

                          <CardContent>
                            <ul className="space-y-3">
                              {(PLAN_FEATURES[plan.name.toLowerCase() as keyof typeof PLAN_FEATURES] || []).map((feature, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </li>
                              ))}
                            </ul>

                            {/* Trial Info */}
                            {plan.trial_period_days && !subscription && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-700">
                                  <Clock className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {plan.trial_period_days}-day free trial
                                  </span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Label>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </RadioGroup>
          )}

          {/* Proration Options (for existing subscriptions) */}
          {subscription && selectedPlan && selectedPlan !== currentPlan?.id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Billing Options</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={prorationOption} onValueChange={setProrationOption}>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="create_prorations" id="prorate" className="mt-1" />
                      <Label htmlFor="prorate" className="flex-1">
                        <div>
                          <div className="font-medium">Prorate charges (Recommended)</div>
                          <div className="text-sm text-muted-foreground">
                            {isUpgrade() 
                              ? "Pay the prorated amount for the rest of your billing period"
                              : "Receive credit for the unused portion of your current plan"
                            }
                          </div>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="none" id="no-prorate" className="mt-1" />
                      <Label htmlFor="no-prorate" className="flex-1">
                        <div>
                          <div className="font-medium">
                            {isUpgrade() ? "Upgrade at next billing cycle" : "Downgrade at next billing cycle"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Changes will take effect on{" "}
                            {subscription.current_period_end && 
                              format(new Date(subscription.current_period_end), "MMMM d, yyyy")
                            }
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Preview Changes Button */}
          {selectedPlan && selectedPlan !== currentPlan?.id && (
            <div className="flex justify-center">
              <Button
                onClick={handlePreview}
                disabled={previewMutation.isPending}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                {previewMutation.isPending ? "Calculating..." : "Preview Changes"}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={showPreview ? handleConfirmChange : handlePreview}
            disabled={!selectedPlan || isConfirming || (!showPreview && previewMutation.isPending)}
            className="flex items-center gap-2"
          >
            {isConfirming ? (
              "Processing..."
            ) : showPreview ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirm {getChangeType()}
              </>
            ) : (
              <>
                {isUpgrade() && <ArrowUp className="h-4 w-4" />}
                {isDowngrade() && <ArrowDown className="h-4 w-4" />}
                {subscription ? `${getChangeType()} Plan` : "Start Subscription"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}