'use client';

import React from 'react';
import { Home, ArrowLeft, Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const { user } = useAuth();
  const router = useRouter();

  const getRoleBasedHomePath = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'client':
        return '/client/dashboard';
      case 'therapist':
        return '/therapist/dashboard';
      case 'moderator':
        return '/moderator/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const getRoleBasedMessage = () => {
    if (!user) {
      return "The page you're looking for doesn't exist. Let's get you back to our homepage where you can explore our mental health support services.";
    }
    
    switch (user.role) {
      case 'client':
        return "Don't worry, let's get you back to your dashboard where you can access your sessions, worksheets, and support resources.";
      case 'therapist':
        return "Let's get you back to your therapist dashboard where you can manage your clients and appointments.";
      case 'moderator':
        return "Let's get you back to your moderation panel where you can oversee community activities.";
      case 'admin':
        return "Let's get you back to your admin dashboard where you can manage the platform.";
      default:
        return "Let's get you back to a place where you can find what you need.";
    }
  };

  const handleGoHome = () => {
    const homePath = getRoleBasedHomePath();
    router.push(homePath);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tertiary via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-[Futura] text-primary">
            Page Not Found
          </CardTitle>
          <p className="text-muted-foreground leading-relaxed">
            {getRoleBasedMessage()}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Supportive Message */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
            <Heart className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-sm text-primary/80">
              Taking care of your mental health is a journey, and we're here to support you every step of the way.
            </p>
          </div>
          
          {/* Navigation Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleGoHome} 
              className="w-full bg-primary hover:bg-primary/90 text-white"
              size="lg"
            >
              <Home className="h-4 w-4 mr-2" />
              {user ? `Go to ${user.role === 'client' ? 'My' : ''} Dashboard` : 'Go to Homepage'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="w-full border-primary/20 text-primary hover:bg-primary/5"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Additional Resources for Authenticated Users */}
          {user && (
            <div className="pt-4 border-t border-primary/10">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Need help finding something?
              </p>
              <div className="grid grid-cols-1 gap-2">
                {user.role === 'client' && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push('/client/worksheets')}
                      className="justify-start text-primary hover:bg-primary/5"
                    >
                      My Worksheets
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push('/client/therapists')}
                      className="justify-start text-primary hover:bg-primary/5"
                    >
                      Find Therapists
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push('/client/communities')}
                      className="justify-start text-primary hover:bg-primary/5"
                    >
                      Support Communities
                    </Button>
                  </>
                )}
                {user.role === 'therapist' && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push('/therapist/clients')}
                      className="justify-start text-primary hover:bg-primary/5"
                    >
                      My Clients
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push('/therapist/schedule')}
                      className="justify-start text-primary hover:bg-primary/5"
                    >
                      My Schedule
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}