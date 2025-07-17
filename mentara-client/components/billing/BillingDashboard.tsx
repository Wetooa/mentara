'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  ExternalLink, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Receipt,
  Settings,
  Plus,
  MoreHorizontal,
  Trash2,
  Star,
  Building,
  Crown
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useSubscriptionPlans,
  usePaymentMethods,
  useInvoices,
  useCancelSubscription,
  useReactivateSubscription,
  useDetachPaymentMethod,
  useSetDefaultPaymentMethod,
  useCreatePortalSession,
  useDownloadInvoice,
  usePayInvoice,
  useSubscriptionStatus,
  useBillingSummary,
} from '@/hooks/billing';
import { PaymentMethodForm } from './PaymentMethodForm';

interface BillingDashboardProps {
  className?: string;
}

export function BillingDashboard({ className }: BillingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  
  const {
    subscription,
    isActive,
    isPastDue,
    isCanceled,
    willCancel,
    hasPaymentIssue,
    isLoading: subscriptionLoading
  } = useSubscriptionStatus();
  
  const { data: plans } = useSubscriptionPlans();
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices({ limit: 10 });
  
  const {
    defaultPaymentMethod,
    unpaidInvoices,
    hasUnpaidInvoices,
    totalUnpaid
  } = useBillingSummary();

  const cancelSubscriptionMutation = useCancelSubscription();
  const reactivateSubscriptionMutation = useReactivateSubscription();
  const detachPaymentMethodMutation = useDetachPaymentMethod();
  const setDefaultPaymentMethodMutation = useSetDefaultPaymentMethod();
  const createPortalSessionMutation = useCreatePortalSession();
  const downloadInvoiceMutation = useDownloadInvoice();
  const payInvoiceMutation = usePayInvoice();

  const getSubscriptionStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'trialing': return 'text-blue-600 bg-blue-50';
      case 'past_due': return 'text-yellow-600 bg-yellow-50';
      case 'canceled': return 'text-gray-600 bg-gray-50';
      case 'incomplete': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSubscriptionStatusLabel = (status?: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'trialing': return 'Trial';
      case 'past_due': return 'Past Due';
      case 'canceled': return 'Canceled';
      case 'incomplete': return 'Incomplete';
      default: return 'Unknown';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const handleCancelSubscription = async (immediately: boolean = false) => {
    try {
      await cancelSubscriptionMutation.mutateAsync(immediately);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      await reactivateSubscriptionMutation.mutateAsync();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleOpenBillingPortal = async () => {
    try {
      const returnUrl = window.location.href;
      await createPortalSessionMutation.mutateAsync(returnUrl);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      await downloadInvoiceMutation.mutateAsync(invoiceId);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      await payInvoiceMutation.mutateAsync({ 
        invoiceId, 
        paymentMethodId: defaultPaymentMethod?.id 
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>
        <Button 
          onClick={handleOpenBillingPortal}
          disabled={createPortalSessionMutation.isPending}
          variant="outline"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Customer Portal
        </Button>
      </div>

      {/* Alert Cards */}
      {hasPaymentIssue && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Payment Issue</h3>
                <p className="text-sm text-red-700 mt-1">
                  {isPastDue 
                    ? 'Your subscription payment is past due. Please update your payment method or pay any outstanding invoices.'
                    : 'There is an issue with your subscription. Please check your payment method.'
                  }
                </p>
                <div className="flex gap-2 mt-3">
                  {hasUnpaidInvoices && (
                    <Button size="sm" onClick={() => setActiveTab('invoices')}>
                      View Unpaid Invoices
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('payment-methods')}>
                    Update Payment Method
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {willCancel && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900">Subscription Ending</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your subscription will end on {subscription?.current_period_end && format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}. 
                  You'll still have access until then.
                </p>
                <Button 
                  size="sm" 
                  className="mt-3"
                  onClick={handleReactivateSubscription}
                  disabled={reactivateSubscriptionMutation.isPending}
                >
                  Reactivate Subscription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Billing History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Subscription Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : subscription ? (
                  <div className="space-y-1">
                    <Badge className={cn('text-xs', getSubscriptionStatusColor(subscription.status))}>
                      {getSubscriptionStatusLabel(subscription.status)}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {subscription.plan.name}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No subscription</p>
                )}
              </CardContent>
            </Card>

            {/* Next Payment */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : subscription && isActive ? (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {formatCurrency(subscription.plan.price, subscription.plan.currency)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming payment</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {paymentMethodsLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {paymentMethods?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {paymentMethods?.length === 1 ? 'method saved' : 'methods saved'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Outstanding Balance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <div className="space-y-1">
                    <div className={cn(
                      'text-2xl font-bold',
                      hasUnpaidInvoices ? 'text-red-600' : 'text-green-600'
                    )}>
                      {hasUnpaidInvoices ? formatCurrency(totalUnpaid) : '$0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {hasUnpaidInvoices ? `${unpaidInvoices.length} unpaid` : 'All paid up'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => setActiveTab('subscription')}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Manage Subscription</div>
                    <div className="text-sm text-muted-foreground">Change plan or cancel</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => setShowAddPaymentMethod(true)}
                >
                  <Plus className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Add Payment Method</div>
                    <div className="text-sm text-muted-foreground">Credit card or bank account</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => setActiveTab('invoices')}
                >
                  <Receipt className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">View Invoices</div>
                    <div className="text-sm text-muted-foreground">Download receipts</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : invoices && invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <Receipt className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            Invoice #{invoice.number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(invoice.amount_due, invoice.currency)}
                        </p>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'} className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('invoices')}
                    className="w-full"
                  >
                    View All Invoices
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No billing activity yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {subscription ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{subscription.plan.name}</h3>
                    <p className="text-muted-foreground">{subscription.plan.description}</p>
                    <div className="flex items-center gap-4">
                      <Badge className={getSubscriptionStatusColor(subscription.status)}>
                        {getSubscriptionStatusLabel(subscription.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(subscription.plan.price, subscription.plan.currency)} / {subscription.plan.interval}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Next billing date</p>
                    <p className="font-medium">
                      {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  {!isCanceled && !willCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">Cancel Subscription</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                          <AlertDialogDescription>
                            You can cancel your subscription at the end of the current billing period or immediately.
                            If you cancel immediately, you'll lose access right away and won't be refunded for the current period.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelSubscription(false)}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            Cancel at Period End
                          </AlertDialogAction>
                          <AlertDialogAction
                            onClick={() => handleCancelSubscription(true)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Cancel Immediately
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {willCancel && (
                    <Button onClick={handleReactivateSubscription}>
                      Reactivate Subscription
                    </Button>
                  )}

                  <Button variant="outline" onClick={handleOpenBillingPortal}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage in Portal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You don't have an active subscription. Choose a plan to get started.
                </p>
                <Button>Choose a Plan</Button>
              </CardContent>
            </Card>
          )}

          {/* Available Plans */}
          {plans && plans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plans.map((plan) => (
                    <Card key={plan.id} className={cn(
                      'relative',
                      plan.is_popular && 'border-primary',
                      subscription?.plan.id === plan.id && 'bg-muted/50'
                    )}>
                      {plan.is_popular && (
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                          Most Popular
                        </Badge>
                      )}
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {plan.name}
                          {subscription?.plan.id === plan.id && (
                            <Badge variant="outline">Current</Badge>
                          )}
                        </CardTitle>
                        <div className="text-2xl font-bold">
                          {formatCurrency(plan.price, plan.currency)}
                          <span className="text-base font-normal text-muted-foreground">
                            /{plan.interval}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {plan.description}
                        </p>
                        <ul className="space-y-2 text-sm">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className="w-full mt-4"
                          variant={subscription?.plan.id === plan.id ? 'outline' : 'default'}
                          disabled={subscription?.plan.id === plan.id}
                        >
                          {subscription?.plan.id === plan.id ? 'Current Plan' : 'Upgrade'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment-methods" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment Methods</CardTitle>
              <Button onClick={() => setShowAddPaymentMethod(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardHeader>
            <CardContent>
              {paymentMethodsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-10 w-16" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : paymentMethods && paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {method.type === 'card' ? (
                            <CreditCard className="h-6 w-6" />
                          ) : (
                            <Building className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {method.type === 'card' 
                                ? `**** **** **** ${method.card?.last4}`
                                : `****${method.bank_account?.last4}`
                              }
                            </span>
                            {method.is_default && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {method.type === 'card' 
                              ? `${method.card?.brand?.toUpperCase()} • Expires ${method.card?.exp_month}/${method.card?.exp_year}`
                              : `${method.bank_account?.bank_name} • ${method.bank_account?.account_type}`
                            }
                          </p>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!method.is_default && (
                            <DropdownMenuItem
                              onClick={() => setDefaultPaymentMethodMutation.mutate(method.id)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => detachPaymentMethodMutation.mutate(method.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No payment methods</h3>
                  <p className="text-muted-foreground mb-4">
                    Add a payment method to manage your subscription
                  </p>
                  <Button onClick={() => setShowAddPaymentMethod(true)}>
                    Add Payment Method
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-10 w-16" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : invoices && invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Receipt className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Invoice #{invoice.number}</span>
                            <Badge 
                              variant={invoice.status === 'paid' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(invoice.created_at), 'MMMM d, yyyy')} • 
                            {formatCurrency(invoice.amount_due, invoice.currency)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {invoice.status === 'open' && defaultPaymentMethod && (
                          <Button
                            size="sm"
                            onClick={() => handlePayInvoice(invoice.id)}
                            disabled={payInvoiceMutation.isPending}
                          >
                            Pay Now
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          disabled={downloadInvoiceMutation.isPending}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
                  <p className="text-muted-foreground">
                    Your billing history will appear here once you have a subscription
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PaymentMethodForm
              onSuccess={() => {
                setShowAddPaymentMethod(false);
                toast.success('Payment method added successfully!');
              }}
              onCancel={() => setShowAddPaymentMethod(false)}
              setAsDefault={!defaultPaymentMethod}
            />
          </div>
        </div>
      )}
    </div>
  );
}