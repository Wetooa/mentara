"use client";

import React, { useState } from "react";
import {
  Plus,
  CreditCard,
  Building,
  Star,
  Trash2,
  MoreHorizontal,
  Smartphone,
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  usePaymentMethods,
  useDetachPaymentMethod,
  useSetDefaultPaymentMethod,
} from "@/hooks/billing";
import { DemoPaymentMethodForm } from "./DemoPaymentMethodForm";

interface PaymentMethodsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PaymentMethod {
  id: string;
  type: "CARD" | "BANK_ACCOUNT" | "DIGITAL_WALLET" | "GCASH" | "MAYA" | "INSURANCE";
  nickname?: string;
  cardLast4?: string;
  cardBrand?: string;
  isDefault: boolean;

  // GCash fields
  gcashNumber?: string;
  gcashName?: string;
  isVerified?: boolean;

  // Maya fields
  mayaNumber?: string;
  mayaName?: string;
  mayaVerified?: boolean;

  // Digital wallet fields
  walletProvider?: string;
  walletAccountName?: string;

  // Bank account fields
  bankName?: string;
  accountLast4?: string;

  // Insurance fields
  insuranceProviderName?: string;
  policyNumber?: string;
  memberId?: string;
  groupNumber?: string;
  insuranceVerified?: boolean;
  coverageDetails?: {
    coverageType?: 'FULL' | 'COPAY' | 'PERCENTAGE';
    copayAmount?: number;
    coveragePercentage?: number;
  };
}

export function PaymentMethodsSheet({
  open,
  onOpenChange,
}: PaymentMethodsSheetProps) {
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);

  const { data: paymentMethods, isLoading: paymentMethodsLoading } =
    usePaymentMethods();
  const detachPaymentMethodMutation = useDetachPaymentMethod();
  const setDefaultPaymentMethodMutation = useSetDefaultPaymentMethod();

  const handleAddPaymentMethodSuccess = () => {
    setShowAddPaymentMethod(false);
  };

  const handleBackToList = () => {
    setShowAddPaymentMethod(false);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "CARD":
        return <CreditCard className="h-6 w-6" />;
      case "BANK_ACCOUNT":
        return <Building className="h-6 w-6" />;
      case "DIGITAL_WALLET":
        return <Smartphone className="h-6 w-6" />;
      case "GCASH":
        return <Smartphone className="h-6 w-6 text-blue-600" />;
      case "MAYA":
        return <Smartphone className="h-6 w-6 text-green-600" />;
      case "INSURANCE":
        return <Shield className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getPaymentMethodDisplay = (method: PaymentMethod) => {
    if (method.nickname) {
      return method.nickname;
    }

    switch (method.type) {
      case "CARD":
        return `**** **** **** ${method.cardLast4}`;
      case "BANK_ACCOUNT":
        return `****${method.accountLast4}`;
      case "DIGITAL_WALLET":
        return method.walletProvider || "Digital Wallet";
      case "GCASH":
        return `GCash ${method.gcashNumber?.slice(-4) || "****"}`;
      case "MAYA":
        return `Maya ${method.mayaNumber?.slice(-4) || "****"}`;
      case "INSURANCE":
        return method.insuranceProviderName || "Insurance";
      default:
        return `****${method.cardLast4}`;
    }
  };

  const getPaymentMethodDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case "CARD":
        return method.cardBrand?.toUpperCase() || "Card";
      case "BANK_ACCOUNT":
        return method.bankName || "Bank Account";
      case "DIGITAL_WALLET":
        return method.walletAccountName || "Digital Wallet";
      case "GCASH":
        const gcashStatus = method.isVerified ? "Verified" : "Unverified";
        return `${method.gcashName} • ${gcashStatus}`;
      case "MAYA":
        const mayaStatus = method.mayaVerified ? "Verified" : "Unverified";
        return `${method.mayaName} • ${mayaStatus}`;
      case "INSURANCE":
        const insuranceStatus = method.insuranceVerified ? "Verified" : "Unverified";
        const policyDisplay = method.policyNumber ? `Policy: ${method.policyNumber.slice(-4)}` : "";
        const coverageInfo = method.coverageDetails?.coverageType === 'FULL' 
          ? 'Full Coverage' 
          : method.coverageDetails?.coverageType === 'COPAY'
          ? `Co-pay: $${method.coverageDetails.copayAmount}`
          : method.coverageDetails?.coverageType === 'PERCENTAGE'
          ? `${method.coverageDetails.coveragePercentage}% Coverage`
          : '';
        return `${policyDisplay}${policyDisplay && coverageInfo ? ' • ' : ''}${coverageInfo} • ${insuranceStatus}`;
      default:
        return "Payment Method";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px] lg:w-[700px]">
        <SheetHeader>
          <SheetTitle>
            {showAddPaymentMethod ? "Add Payment Method" : "Payment Methods"}
          </SheetTitle>
          <SheetDescription>
            {showAddPaymentMethod
              ? "Add a new payment method to your account"
              : "Manage your payment methods for therapy sessions and subscriptions."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {!showAddPaymentMethod ? (
            <div className="flex-1 overflow-auto">
              {/* Header Section */}
              <div className="sticky top-0 bg-background border-b pb-6 mb-6 z-10">
                <div className="flex justify-between items-start pt-6 px-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Your Payment Methods
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Securely manage your payment options for therapy sessions
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAddPaymentMethod(true)}
                    className="gap-2 shadow-sm hover:shadow-md transition-shadow"
                    size="lg"
                  >
                    <Plus className="h-4 w-4" />
                    Add Method
                  </Button>
                </div>
              </div>

              {/* Payment Methods List */}
              <div className="space-y-6 px-6">
                {paymentMethodsLoading ? (
                  <div className="space-y-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Card
                        key={i}
                        className="border border-gray-200 shadow-sm bg-white"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-40" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : paymentMethods && paymentMethods.length > 0 ? (
                  <div className="space-y-6">
                    {paymentMethods.map((method: PaymentMethod) => (
                      <Card
                        key={method.id}
                        className="border border-gray-200 shadow-sm bg-white hover:shadow-md hover:border-primary/30 transition-all duration-200 group cursor-pointer"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                {getPaymentMethodIcon(method.type)}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-gray-900 text-lg">
                                      {getPaymentMethodDisplay(method)}
                                    </span>
                                    {method.isDefault && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium px-2 py-1 text-xs"
                                      >
                                        Default
                                      </Badge>
                                    )}
                                    {method.type === 'INSURANCE' && method.insuranceVerified && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-700 border-green-200 font-medium px-2 py-1 text-xs flex items-center gap-1"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                        Verified
                                      </Badge>
                                    )}
                                    {method.type === 'INSURANCE' && !method.insuranceVerified && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-yellow-100 text-yellow-700 border-yellow-200 font-medium px-2 py-1 text-xs flex items-center gap-1"
                                      >
                                        <XCircle className="h-3 w-3" />
                                        Unverified
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-gray-500 text-sm">
                                  {getPaymentMethodDetails(method)}
                                </p>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 shadow-md border-gray-200"
                              >
                                {!method.isDefault && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setDefaultPaymentMethodMutation.mutate(
                                        method.id
                                      )
                                    }
                                    className="gap-3 text-gray-600 hover:bg-gray-50"
                                  >
                                    <Star className="h-4 w-4" />
                                    Set as Default
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    detachPaymentMethodMutation.mutate(
                                      method.id
                                    )
                                  }
                                  className="text-red-500 gap-3 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-8">
                    <div className="w-24 h-24 mx-auto bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                      <CreditCard className="h-10 w-10 text-gray-400" />
                    </div>

                    <div className="text-center mt-8 space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        No payment methods yet
                      </h3>
                      <p className="text-gray-500 max-w-sm mx-auto leading-relaxed text-sm">
                        Add a payment method to book therapy sessions and manage
                        your subscriptions seamlessly.
                      </p>
                      <div className="pt-4">
                        <Button
                          onClick={() => setShowAddPaymentMethod(true)}
                          size="lg"
                          className="gap-3 shadow-sm hover:shadow-md transition-shadow px-8 py-3"
                        >
                          <Plus className="h-5 w-5" />
                          Add Your First Payment Method
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Section */}
                <div className="mt-6 mb-6">
                  <Card className="bg-blue-50/50 border-blue-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-blue-100 rounded-xl border border-blue-200">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Secure Payment Processing
                          </h4>
                          <p className="text-gray-500 text-sm leading-relaxed">
                            Your payment information is securely processed and
                            encrypted using industry-standard security measures.
                            You can safely manage multiple payment methods and
                            set a default for seamless automatic payments.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              {/* Back Button */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 px-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="gap-2 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Payment Methods
                </Button>
              </div>

              {/* Add Payment Method Form - Embedded Version */}
              <div className="space-y-6 px-6">
                <DemoPaymentMethodForm
                  onSuccess={handleAddPaymentMethodSuccess}
                  onCancel={handleBackToList}
                  embedded={true}
                />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
