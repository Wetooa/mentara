'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { 
  Shield, 
  CheckCircle, 
  XCircle,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreatePaymentMethod, useSetDefaultPaymentMethod } from '@/hooks/billing';
import { useApi } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

// Mock insurance providers for autocomplete
const INSURANCE_PROVIDERS = [
  'BlueCross Blue Shield',
  'Aetna',
  'Cigna',
  'UnitedHealth',
  'Humana',
  'Kaiser Permanente',
  'Anthem',
  'Medicare',
  'Medicaid',
  'BCBS',
];

const insuranceSchema = z.object({
  insuranceProviderName: z.string().min(2, 'Insurance provider name is required'),
  policyNumber: z.string().regex(/^[A-Za-z0-9]{8,12}$/, 'Policy number must be 8-12 alphanumeric characters'),
  memberId: z.string().min(1, 'Member ID is required'),
  groupNumber: z.string().optional(),
  nickname: z.string().optional(),
  coverageType: z.enum(['FULL', 'COPAY', 'PERCENTAGE']),
  copayAmount: z.number().min(0).optional(),
  coveragePercentage: z.number().min(0).max(100).optional(),
  isDefault: z.boolean().optional(),
}).refine((data) => {
  if (data.coverageType === 'COPAY' && !data.copayAmount) {
    return false;
  }
  if (data.coverageType === 'PERCENTAGE' && !data.coveragePercentage) {
    return false;
  }
  return true;
}, {
  message: 'Co-pay amount or coverage percentage is required based on coverage type',
  path: ['coverageType'],
});

type InsuranceFormData = z.infer<typeof insuranceSchema>;

interface InsurancePaymentFormProps {
  onSuccess?: (paymentMethod: any) => void;
  onCancel?: () => void;
  setAsDefault?: boolean;
  className?: string;
}

export function InsurancePaymentForm({
  onSuccess,
  onCancel,
  setAsDefault = false,
  className,
}: InsurancePaymentFormProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verified' | 'failed'>('idle');
  const [verificationErrors, setVerificationErrors] = useState<string[]>([]);
  const [createdPaymentMethodId, setCreatedPaymentMethodId] = useState<string | null>(null);

  const createPaymentMethodMutation = useCreatePaymentMethod();
  const setDefaultMutation = useSetDefaultPaymentMethod();
  const api = useApi();
  const queryClient = useQueryClient();

  const verifyInsuranceMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      return api.billing.verifyInsurance(paymentMethodId);
    },
    onSuccess: (data: any) => {
      if (data.insuranceVerified) {
        setVerificationStatus('verified');
        setVerificationErrors([]);
        toast.success('Insurance verified successfully!');
      } else {
        setVerificationStatus('failed');
        setVerificationErrors(data.verificationErrors || ['Verification failed']);
        toast.error('Insurance verification failed');
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.paymentMethods() });
    },
    onError: () => {
      setVerificationStatus('failed');
      setVerificationErrors(['Verification failed. Please try again.']);
      toast.error('Failed to verify insurance');
    },
    onSettled: () => {
      setIsVerifying(false);
    },
  });

  const form = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      insuranceProviderName: '',
      policyNumber: '',
      memberId: '',
      groupNumber: '',
      nickname: '',
      coverageType: 'FULL',
      copayAmount: undefined,
      coveragePercentage: undefined,
      isDefault: setAsDefault,
    },
  });

  const coverageType = form.watch('coverageType');

  const handleVerify = async () => {
    if (!createdPaymentMethodId) {
      toast.error('Please save the payment method first');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('idle');
    await verifyInsuranceMutation.mutateAsync(createdPaymentMethodId);
  };

  const onSubmit = async (data: InsuranceFormData) => {
    try {
      const coverageDetails: any = {
        coverageType: data.coverageType,
      };

      if (data.coverageType === 'COPAY' && data.copayAmount) {
        coverageDetails.copayAmount = data.copayAmount;
      } else if (data.coverageType === 'PERCENTAGE' && data.coveragePercentage) {
        coverageDetails.coveragePercentage = data.coveragePercentage;
      }

      const paymentMethod = await createPaymentMethodMutation.mutateAsync({
        type: 'INSURANCE',
        nickname: data.nickname || `${data.insuranceProviderName} - ${data.policyNumber.slice(-4)}`,
        insuranceProviderName: data.insuranceProviderName,
        policyNumber: data.policyNumber,
        memberId: data.memberId,
        groupNumber: data.groupNumber,
        coverageDetails,
        isDefault: data.isDefault,
      });

      setCreatedPaymentMethodId(paymentMethod.id);

      if (data.isDefault) {
        await setDefaultMutation.mutateAsync(paymentMethod.id);
      }

      toast.success('Insurance payment method added successfully!');
      onSuccess?.(paymentMethod);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add insurance payment method');
      console.error('Insurance payment method creation error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${className || ''}`}>
        {/* Insurance Provider */}
        <FormField
          control={form.control}
          name="insuranceProviderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Insurance Provider *</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURANCE_PROVIDERS.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other (enter manually)</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              {field.value === 'other' && (
                <Input
                  placeholder="Enter provider name"
                  {...field}
                  value={field.value === 'other' ? '' : field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Policy Number */}
        <FormField
          control={form.control}
          name="policyNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy Number *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter policy number (8-12 alphanumeric)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                8-12 alphanumeric characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Member ID */}
        <FormField
          control={form.control}
          name="memberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member ID *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter member ID"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Group Number (Optional) */}
        <FormField
          control={form.control}
          name="groupNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter group number (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nickname */}
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nickname</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Primary Insurance"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional: A friendly name to identify this insurance
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Coverage Type */}
        <FormField
          control={form.control}
          name="coverageType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coverage Type *</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset dependent fields
                  form.setValue('copayAmount', undefined);
                  form.setValue('coveragePercentage', undefined);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FULL">Full Coverage (100%)</SelectItem>
                  <SelectItem value="COPAY">Co-pay (Fixed Amount)</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage Coverage</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Co-pay Amount (if COPAY) */}
        {coverageType === 'COPAY' && (
          <FormField
            control={form.control}
            name="copayAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Co-pay Amount *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Fixed amount the client pays per session
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Coverage Percentage (if PERCENTAGE) */}
        {coverageType === 'PERCENTAGE' && (
          <FormField
            control={form.control}
            name="coveragePercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coverage Percentage *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="80"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Percentage of session cost covered by insurance (0-100%)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Set as Default */}
        <FormField
          control={form.control}
          name="isDefault"
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

        {/* Verification Section */}
        {createdPaymentMethodId && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Insurance Verification</span>
              </div>
              {verificationStatus === 'verified' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Verified</span>
                </div>
              )}
              {verificationStatus === 'failed' && (
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Verification Failed</span>
                </div>
              )}
            </div>
            
            {verificationErrors.length > 0 && (
              <div className="space-y-1">
                {verificationErrors.map((error, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleVerify}
              disabled={isVerifying || verificationStatus === 'verified'}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : verificationStatus === 'verified' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verified
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Insurance
                </>
              )}
            </Button>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3 mt-0.5" />
              <p>
                Verification is required before using this insurance for payments. 
                This is a mock verification for demonstration purposes.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={createPaymentMethodMutation.isPending || setDefaultMutation.isPending}
            className="flex-1"
          >
            {(createPaymentMethodMutation.isPending || setDefaultMutation.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Insurance'
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
  );
}

