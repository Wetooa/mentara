"use client";

import React, { useState, useEffect } from "react";
import { Check, X, Package, Clock, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function AdminPackagesView() {
  const api = useApi();
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const data = await api.packages.getPendingPackages();
      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch pending packages:", error);
      toast.error("Failed to load pending packages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleApprove = async (packageId: string) => {
    try {
      await api.packages.approvePackage(packageId);
      toast.success("Package approved successfully");
      fetchPackages(); // Refresh list
    } catch (error) {
      console.error("Failed to approve package:", error);
      toast.error("Failed to approve package");
    }
  };

  const handleReject = async (packageId: string) => {
    try {
      await api.packages.rejectPackage(packageId);
      toast.success("Package rejected");
      fetchPackages(); // Refresh list
    } catch (error) {
      console.error("Failed to reject package:", error);
      toast.error("Failed to reject package");
    }
  };

  const formatPrice = (price: any) => {
    const val = typeof price === 'object' && price !== null ? price.toString() : price;
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(val));
  };

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pending Therapist Packages</h1>
        <p className="text-gray-500 mt-1">
          Review and approve new therapy packages created by therapists.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-gray-50 rounded-t-xl" />
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
          <p className="text-gray-500 max-w-sm">
            There are no pending packages waiting for your approval right now.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {packages.map((pkg) => (
            <Card key={pkg.packageId} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{pkg.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1 gap-4">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Therapist ID: {pkg.therapistId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Pending Approval
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Pending
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                  
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Price</p>
                      <p className="text-lg font-semibold text-primary">{formatPrice(pkg.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sessions</p>
                      <p className="text-lg font-semibold">{pkg.sessionCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Validity</p>
                      <p className="text-lg font-semibold">{pkg.validityDays} Days</p>
                    </div>
                  </div>

                  {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Features Included</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {pkg.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Actions Sidebar */}
                <div className="md:w-64 bg-gray-50 p-6 flex flex-col justify-center border-t md:border-t-0 md:border-l">
                  <h4 className="text-sm font-medium text-gray-900 mb-4 whitespace-nowrap">Review Actions</h4>
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 justify-start" 
                      onClick={() => handleApprove(pkg.packageId)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve Package
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 justify-start"
                      onClick={() => handleReject(pkg.packageId)}  
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject Package
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                    Approving this package will make it immediately available for clients to purchase.
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
