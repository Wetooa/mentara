'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Smartphone,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreatePaymentMethod } from '@/hooks/billing';

// Validation schemas for different payment types
const cardSchema = z.object({
  type: z.literal('CARD'),
  nickname: z.string().optional(),
  cardholderName: z.string().min(2, 'Cardholder name is required'),
  cardNumber: z.string().min(13, 'Card number must be at least 13 digits'),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(2024).max(2040),
  cardType: z.string().min(1, 'Card type is required'),
  setAsDefault: z.boolean().optional(),
});

const bankAccountSchema = z.object({
  type: z.literal('BANK_ACCOUNT'),
  nickname: z.string().optional(),
  bankName: z.string().min(1, 'Bank name is required'),
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  accountType: z.enum(['Checking', 'Savings']),
  routingNumber: z.string().length(9, 'Routing number must be 9 digits'),
  accountNumber: z.string().min(4, 'Account number is required'),
  setAsDefault: z.boolean().optional(),
});

const gcashSchema = z.object({
  type: z.literal('GCASH'),
  nickname: z.string().optional(),
  gcashNumber: z.string().regex(/^09\d{9}$/, 'Invalid GCash number format (09XXXXXXXXX)'),
  gcashName: z.string().min(2, 'GCash account name is required'),
  gcashEmail: z.string().email('Invalid email address').optional(),
  setAsDefault: z.boolean().optional(),
});

const mayaSchema = z.object({
  type: z.literal('MAYA'),
  nickname: z.string().optional(),
  mayaNumber: z.string().regex(/^09\d{9}$/, 'Invalid Maya number format (09XXXXXXXXX)'),
  mayaName: z.string().min(2, 'Maya account name is required'),
  mayaEmail: z.string().email('Invalid email address').optional(),
  setAsDefault: z.boolean().optional(),
});

const digitalWalletSchema = z.object({
  type: z.literal('DIGITAL_WALLET'),
  nickname: z.string().optional(),
  walletProvider: z.enum(['PayPal', 'Apple Pay', 'Google Pay', 'Samsung Pay', 'Amazon Pay']),
  walletEmail: z.string().email('Invalid email address'),
  walletAccountName: z.string().min(2, 'Account name is required'),
  setAsDefault: z.boolean().optional(),
});

type PaymentMethodFormData = z.infer<typeof cardSchema> | 
                            z.infer<typeof bankAccountSchema> | 
                            z.infer<typeof gcashSchema> | 
                            z.infer<typeof mayaSchema> | 
                            z.infer<typeof digitalWalletSchema>;

interface DemoPaymentMethodFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  embedded?: boolean;
}

export function DemoPaymentMethodForm({ onSuccess, onCancel, embedded = false }: DemoPaymentMethodFormProps) {
  const [paymentType, setPaymentType] = useState<'CARD' | 'BANK_ACCOUNT' | 'GCASH' | 'MAYA' | 'DIGITAL_WALLET'>('CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createPaymentMethodMutation = useCreatePaymentMethod();

  // Get the appropriate schema based on payment type
  const getSchema = () => {
    switch (paymentType) {
      case 'CARD': return cardSchema;
      case 'BANK_ACCOUNT': return bankAccountSchema;
      case 'GCASH': return gcashSchema;
      case 'MAYA': return mayaSchema;
      case 'DIGITAL_WALLET': return digitalWalletSchema;
    }
  };

  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      type: paymentType,
      setAsDefault: false,
    },
  });

  // Reset form when payment type changes
  React.useEffect(() => {
    form.reset({
      type: paymentType,
      setAsDefault: false,
    });
  }, [paymentType, form]);

  const onSubmit = async (data: PaymentMethodFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call the API
      // await createPaymentMethodMutation.mutateAsync(data);
      
      toast.success('Payment method added successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to add payment method. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCardForm = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="cardholderName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cardholder Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="cardNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Card Number</FormLabel>
            <FormControl>
              <Input placeholder="1234 5678 9012 3456" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="expiryMonth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Month</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString()}>
                      {month.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="expiryYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({length: 17}, (_, i) => 2024 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cardType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Type</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Visa">Visa</SelectItem>
                  <SelectItem value="Mastercard">Mastercard</SelectItem>
                  <SelectItem value="American Express">Amex</SelectItem>
                  <SelectItem value="Discover">Discover</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderBankAccountForm = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="bankName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Name</FormLabel>
            <Select onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Chase Bank">Chase Bank</SelectItem>
                <SelectItem value="Bank of America">Bank of America</SelectItem>
                <SelectItem value="Wells Fargo">Wells Fargo</SelectItem>
                <SelectItem value="Citibank">Citibank</SelectItem>
                <SelectItem value="US Bank">US Bank</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="accountHolderName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Holder Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="accountType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Type</FormLabel>
            <Select onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Checking">Checking</SelectItem>
                <SelectItem value="Savings">Savings</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="routingNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Routing Number</FormLabel>
              <FormControl>
                <Input placeholder="123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input placeholder="Account number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderGCashForm = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="gcashNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GCash Mobile Number</FormLabel>
            <FormControl>
              <Input placeholder="09123456789" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="gcashName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GCash Account Name</FormLabel>
            <FormControl>
              <Input placeholder="Juan Dela Cruz" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="gcashEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="email@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderMayaForm = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="mayaNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maya Mobile Number</FormLabel>
            <FormControl>
              <Input placeholder="09123456789" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="mayaName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maya Account Name</FormLabel>
            <FormControl>
              <Input placeholder="Juan Dela Cruz" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="mayaEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="email@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderDigitalWalletForm = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="walletProvider"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Wallet Provider</FormLabel>
            <Select onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet provider" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Apple Pay">Apple Pay</SelectItem>
                <SelectItem value="Google Pay">Google Pay</SelectItem>
                <SelectItem value="Samsung Pay">Samsung Pay</SelectItem>
                <SelectItem value="Amazon Pay">Amazon Pay</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="walletEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Wallet Email</FormLabel>
            <FormControl>
              <Input placeholder="wallet@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="walletAccountName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const formContent = (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Type Selection */}
            <Tabs value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="CARD" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="BANK_ACCOUNT" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Bank
                </TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2 mb-6">
                <Button 
                  type="button"
                  variant={paymentType === 'GCASH' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentType('GCASH')}
                  className="flex-1"
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  GCash
                </Button>
                <Button 
                  type="button"
                  variant={paymentType === 'MAYA' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentType('MAYA')}
                  className="flex-1"
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Maya
                </Button>
                <Button 
                  type="button"
                  variant={paymentType === 'DIGITAL_WALLET' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentType('DIGITAL_WALLET')}
                  className="flex-1"
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Wallet
                </Button>
              </div>
            </Tabs>

            {/* Nickname field for all types */}
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="My primary card" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Render appropriate form based on payment type */}
            {paymentType === 'CARD' && renderCardForm()}
            {paymentType === 'BANK_ACCOUNT' && renderBankAccountForm()}
            {paymentType === 'GCASH' && renderGCashForm()}
            {paymentType === 'MAYA' && renderMayaForm()}
            {paymentType === 'DIGITAL_WALLET' && renderDigitalWalletForm()}

            {/* Set as default checkbox */}
            <FormField
              control={form.control}
              name="setAsDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set as default payment method</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Action buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Add Method
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Add Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}