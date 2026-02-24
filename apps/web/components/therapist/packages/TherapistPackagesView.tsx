"use client";

import React, { useState, useEffect } from "react";
import { Plus, Package as PackageIcon, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreatePackageDialog } from "./CreatePackageDialog";

export function TherapistPackagesView() {
  const api = useApi();
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const data = await api.packages.getTherapistPackages();
      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      toast.error("Failed to load packages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "REJECTED":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const formatPrice = (price: any) => {
    const val = typeof price === 'object' && price !== null ? price.toString() : price;
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(val));
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Packages</h1>
          <p className="text-gray-500 mt-1">
            Create and manage therapy packages for your clients.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Package
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-gray-100 rounded-t-xl" />
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <PackageIcon className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Packages Yet</h3>
          <p className="text-gray-500 max-w-sm mb-6">
            You haven't created any therapy packages yet. Create your first package to offer bundled sessions to your clients.
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>Create Your First Package</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.packageId} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={getStatusColor(pkg.status)}>
                    <span className="flex items-center gap-1.5">
                      {getStatusIcon(pkg.status)}
                      {pkg.status.replace("_", " ")}
                    </span>
                  </Badge>
                  <span className="font-semibold text-lg text-primary">
                    {formatPrice(pkg.price)}
                  </span>
                </div>
                <CardTitle className="line-clamp-1" title={pkg.title}>{pkg.title}</CardTitle>
                <CardDescription className="line-clamp-2" title={pkg.description}>
                  {pkg.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 mb-1">Sessions</p>
                      <p className="font-semibold">{pkg.sessionCount}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500 mb-1">Validity</p>
                      <p className="font-semibold">{pkg.validityDays} Days</p>
                    </div>
                  </div>
                  
                  {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Features Included:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {pkg.features.slice(0, 3).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feature}</span>
                          </li>
                        ))}
                        {pkg.features.length > 3 && (
                          <li className="text-gray-400 pl-6">+{pkg.features.length - 3} more...</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePackageDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onSuccess={fetchPackages}
      />
    </div>
  );
}
