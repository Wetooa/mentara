'use client';

import React, { useState } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { CreatePaymentMethodDto } from '../../types/domain';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  CreditCard, 
  Building, 
  Lock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCreatePaymentMethod, useSetDefaultPaymentMethod } from '@/hooks/billing';
import { InsurancePaymentForm } from './InsurancePaymentForm';

// Initialize Stripe (you would get this from environment variables)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Validation schemas
const billingDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
});

const bankAccountSchema = z.object({
  account_number: z.string().min(4, 'Account number is required'),
  routing_number: z.string().min(9, 'Routing number must be 9 digits').max(9),
  account_type: z.enum(['checking', 'savings']),
});

type BillingDetailsForm = z.infer<typeof billingDetailsSchema>;
type BankAccountForm = z.infer<typeof bankAccountSchema>;

interface PaymentMethodFormProps {
  onSuccess?: (paymentMethod: CreatePaymentMethodDto) => void;
  onCancel?: () => void;
  setAsDefault?: boolean;
  allowBankAccount?: boolean;
  className?: string;
}

// Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: 'hsl(var(--foreground))',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: 'hsl(var(--muted-foreground))',
      },
    },
    invalid: {
      color: 'hsl(var(--destructive))',
      iconColor: 'hsl(var(--destructive))',
    },
  },
  hidePostalCode: false,
};

// Country options for billing address
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
];

// US states for address validation
const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

function PaymentMethodFormContent({ 
  onSuccess, 
  onCancel, 
  setAsDefault = false,
  allowBankAccount = true,
  className 
}: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentType, setPaymentType] = useState<'card' | 'bank_account' | 'insurance'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [makeDefault, setMakeDefault] = useState(setAsDefault);

  const createPaymentMethodMutation = useCreatePaymentMethod();
  const setDefaultMutation = useSetDefaultPaymentMethod();

  // Billing details form
  const billingForm = useForm<BillingDetailsForm>({
    resolver: zodResolver(billingDetailsSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
      },
    },
  });

  // Bank account form
  const bankForm = useForm<BankAccountForm>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      account_number: '',
      routing_number: '',
      account_type: 'checking',
    },
  });

  const handleCardElementChange = (event: { error?: { message: string }; complete: boolean }) => {
    setCardError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

  const handleSubmit = async (billingData: BillingDetailsForm) => {
    if (!stripe || !elements) {
      toast.error('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentType === 'card') {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card element not found');
        }

        // Create payment method with Stripe
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: billingData.name,
            email: billingData.email || undefined,
            phone: billingData.phone || undefined,
            address: {
              line1: billingData.address.line1,
              line2: billingData.address.line2 || undefined,
              city: billingData.address.city,
              state: billingData.address.state,
              postal_code: billingData.address.postal_code,
              country: billingData.address.country,
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!paymentMethod) {
          throw new Error('Failed to create payment method');
        }

        // Attach payment method to customer via API
        await createPaymentMethodMutation.mutateAsync({
          type: 'card',
          billing_details: {
            name: billingData.name,
            email: billingData.email,
            phone: billingData.phone,
            address: billingData.address,
          },
        });

        // Set as default if requested
        if (makeDefault) {
          await setDefaultMutation.mutateAsync(paymentMethod.id);
        }

        onSuccess?.(paymentMethod);
        toast.success('Payment method added successfully!');

      } else if (paymentType === 'bank_account') {
        const bankData = bankForm.getValues();
        
        // For bank accounts, we handle this through our API
        const paymentMethod = await createPaymentMethodMutation.mutateAsync({
          type: 'bank_account',
          bank_account: bankData,
          billing_details: {
            name: billingData.name,
            email: billingData.email,
            phone: billingData.phone,
            address: billingData.address,
          },
        });

        if (makeDefault) {
          await setDefaultMutation.mutateAsync(paymentMethod.id);
        }

        onSuccess?.(paymentMethod);
        toast.success('Bank account added successfully!');
      }

    } catch (error: Error | unknown) {
      console.error('Payment method creation error:', error);
      toast.error(error.message || 'Failed to add payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Add Payment Method
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          Your payment information is securely processed by Stripe
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Type Selection */}
        <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as 'card' | 'bank_account' | 'insurance')}>
          <TabsList className={cn(
            "grid w-full",
            allowBankAccount ? "grid-cols-3" : "grid-cols-2"
          )}>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit/Debit Card
            </TabsTrigger>
            {allowBankAccount && (
              <TabsTrigger value="bank_account" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Bank Account
              </TabsTrigger>
            )}
            <TabsTrigger value="insurance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Insurance
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {paymentType === 'insurance' ? (
          <InsurancePaymentForm
            onSuccess={onSuccess}
            onCancel={onCancel}
            setAsDefault={setAsDefault}
          />
        ) : (
          <Form {...billingForm}>
            <form onSubmit={billingForm.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Payment Method Input */}
              <div className="space-y-4">
                {paymentType === 'card' ? (
                <div className="space-y-2">
                  <FormLabel htmlFor="card-element">Card Information</FormLabel>
                  <div className={cn(
                    'border rounded-md p-3 bg-background',
                    cardError && 'border-destructive',
                    cardComplete && 'border-green-500'
                  )}>
                    <CardElement
                      id="card-element"
                      options={cardElementOptions}
                      onChange={handleCardElementChange}
                    />
                  </div>
                  {cardError && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {cardError}
                    </div>
                  )}
                  {cardComplete && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Card details are complete
                    </div>
                  )}
                </div>
              ) : (
                <Form {...bankForm}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={bankForm.control}
                        name="routing_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Routing Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123456789"
                                maxLength={9}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={bankForm.control}
                        name="account_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="checking">Checking</SelectItem>
                                <SelectItem value="savings">Savings</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={bankForm.control}
                      name="account_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              )}
            </div>

            {/* Billing Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Billing Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={billingForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={billingForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={billingForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <div className="space-y-4">
                <h4 className="font-medium">Address</h4>
                
                <FormField
                  control={billingForm.control}
                  name="address.line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1 *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={billingForm.control}
                  name="address.line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Apartment, suite, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={billingForm.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={billingForm.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          {billingForm.watch('address.country') === 'US' ? (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {usStates.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder="State/Province"
                              {...field}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={billingForm.control}
                    name="address.postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={billingForm.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Set as Default */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="make-default"
                checked={makeDefault}
                onCheckedChange={setMakeDefault}
              />
              <FormLabel
                htmlFor="make-default"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Set as default payment method
              </FormLabel>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Secure Payment Processing</p>
                <p>Your payment information is encrypted and securely processed by Stripe. We never store your card details on our servers.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={
                  isProcessing || 
                  !stripe || 
                  !elements || 
                  (paymentType === 'card' && !cardComplete) ||
                  createPaymentMethodMutation.isPending ||
                  setDefaultMutation.isPending
                }
                className="flex-1"
              >
                {(isProcessing || createPaymentMethodMutation.isPending || setDefaultMutation.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add Payment Method'
                )}
              </Button>
              
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
        )}
      </CardContent>
    </Card>
  );
}

export function PaymentMethodForm(props: PaymentMethodFormProps) {
  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: 'hsl(var(--primary))',
        colorBackground: 'hsl(var(--background))',
        colorText: 'hsl(var(--foreground))',
        colorDanger: 'hsl(var(--destructive))',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentMethodFormContent {...props} />
    </Elements>
  );
}

// Export the PaymentMethodsSheet component for client sessions
export { PaymentMethodsSheet } from './PaymentMethodsSheet';
