'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Building, 
  Lock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCreatePaymentMethod, useSetDefaultPaymentMethod } from '@/hooks/billing';

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
  onSuccess?: (paymentMethod: any) => void;
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
  const [paymentType, setPaymentType] = useState<'card' | 'bank_account'>('card');
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

  const handleCardElementChange = (event: any) => {
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

    } catch (error: any) {
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
        {allowBankAccount && (
          <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as 'card' | 'bank_account')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Credit/Debit Card
              </TabsTrigger>
              <TabsTrigger value="bank_account" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Bank Account
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <form onSubmit={billingForm.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Payment Method Input */}
          <div className="space-y-4">
            {paymentType === 'card' ? (
              <div className="space-y-2">
                <Label htmlFor="card-element">Card Information</Label>
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="routing_number">Routing Number</Label>
                    <Input
                      id="routing_number"
                      placeholder="123456789"
                      maxLength={9}
                      {...bankForm.register('routing_number')}
                    />
                    {bankForm.formState.errors.routing_number && (
                      <p className="text-sm text-destructive">
                        {bankForm.formState.errors.routing_number.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select 
                      value={bankForm.watch('account_type')} 
                      onValueChange={(value) => bankForm.setValue('account_type', value as 'checking' | 'savings')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    type="password"
                    placeholder="••••••••••••"
                    {...bankForm.register('account_number')}
                  />
                  {bankForm.formState.errors.account_number && (
                    <p className="text-sm text-destructive">
                      {bankForm.formState.errors.account_number.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Billing Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Billing Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...billingForm.register('name')}
                />
                {billingForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {billingForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...billingForm.register('email')}
                />
                {billingForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {billingForm.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                {...billingForm.register('phone')}
              />
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h4 className="font-medium">Address</h4>
              
              <div className="space-y-2">
                <Label htmlFor="line1">Address Line 1 *</Label>
                <Input
                  id="line1"
                  placeholder="123 Main Street"
                  {...billingForm.register('address.line1')}
                />
                {billingForm.formState.errors.address?.line1 && (
                  <p className="text-sm text-destructive">
                    {billingForm.formState.errors.address.line1.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="line2">Address Line 2</Label>
                <Input
                  id="line2"
                  placeholder="Apartment, suite, etc."
                  {...billingForm.register('address.line2')}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="San Francisco"
                    {...billingForm.register('address.city')}
                  />
                  {billingForm.formState.errors.address?.city && (
                    <p className="text-sm text-destructive">
                      {billingForm.formState.errors.address.city.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  {billingForm.watch('address.country') === 'US' ? (
                    <Select 
                      value={billingForm.watch('address.state')} 
                      onValueChange={(value) => billingForm.setValue('address.state', value)}
                    >
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
                      id="state"
                      placeholder="State/Province"
                      {...billingForm.register('address.state')}
                    />
                  )}
                  {billingForm.formState.errors.address?.state && (
                    <p className="text-sm text-destructive">
                      {billingForm.formState.errors.address.state.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    placeholder="12345"
                    {...billingForm.register('address.postal_code')}
                  />
                  {billingForm.formState.errors.address?.postal_code && (
                    <p className="text-sm text-destructive">
                      {billingForm.formState.errors.address.postal_code.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select 
                    value={billingForm.watch('address.country')} 
                    onValueChange={(value) => billingForm.setValue('address.country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {billingForm.formState.errors.address?.country && (
                    <p className="text-sm text-destructive">
                      {billingForm.formState.errors.address.country.message}
                    </p>
                  )}
                </div>
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
            <Label
              htmlFor="make-default"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set as default payment method
            </Label>
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