'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { CheckCircle, CreditCard, Zap, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  description: string;
  features: string[];
}

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 5,
    price: 99,
    description: 'Perfect for small teams just getting started',
    features: [
      '5 profile unlocks',
      'Basic search filters',
      'Email support',
      'CV downloads'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    credits: 20,
    price: 349,
    originalPrice: 399,
    popular: true,
    description: 'Most popular choice for growing companies',
    features: [
      '20 profile unlocks',
      'Advanced search filters',
      'Priority email support',
      'CV downloads',
      'Save searches',
      'Shortlist candidates'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 50,
    price: 799,
    originalPrice: 999,
    description: 'Best value for larger organizations',
    features: [
      '50 profile unlocks',
      'All search features',
      'Priority phone & email support',
      'CV downloads',
      'Save searches',
      'Shortlist candidates',
      'Team collaboration',
      'Custom reports'
    ]
  }
];

export default function CompanyPaymentPage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedPackage, setSelectedPackage] = useState<string>('professional');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    setIsProcessing(true);
    
    // TODO: Integrate with Stripe payment
    // For now, we'll simulate a successful payment and grant credits
    try {
      const selectedPkg = creditPackages.find(pkg => pkg.id === selectedPackage);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, grant credits directly
      // In production, this would happen after Stripe webhook confirms payment
      toast.success(`Payment successful! ${selectedPkg?.credits} credits added to your account.`);
      
      // Redirect to search page
      router.push('/search');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip payment for now
    router.push('/search');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Board Champions</h1>
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Account Created</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Company Details</span>
              </div>
              <div className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mr-2">
                  3
                </div>
                <span className="text-sm font-medium text-gray-900">Choose Plan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Credit Package
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock access to verified board-ready executives. Each credit allows you to view one complete profile including contact details and CV.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex justify-center items-center space-x-8 mb-12">
          <div className="flex items-center text-gray-600">
            <Shield className="h-5 w-5 mr-2" />
            <span className="text-sm">Secure Payment</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Zap className="h-5 w-5 mr-2" />
            <span className="text-sm">Instant Access</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-5 w-5 mr-2" />
            <span className="text-sm">500+ Executives</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {creditPackages.map((pkg) => (
              <div key={pkg.id} className="relative">
                {pkg.popular && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card
                  className={`p-6 cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? 'ring-2 ring-blue-600 shadow-lg'
                      : 'hover:shadow-md'
                  } ${pkg.popular ? 'border-blue-200' : ''}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <RadioGroupItem
                    value={pkg.id}
                    id={pkg.id}
                    className="sr-only"
                  />
                  <Label htmlFor={pkg.id} className="cursor-pointer">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {pkg.name}
                        </h3>
                        <p className="text-gray-600 mt-2">{pkg.description}</p>
                      </div>

                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          £{pkg.price}
                        </span>
                        {pkg.originalPrice && (
                          <span className="ml-2 text-lg text-gray-500 line-through">
                            £{pkg.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between py-4 border-y border-gray-200">
                        <span className="text-gray-600">Credits included</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {pkg.credits}
                        </span>
                      </div>

                      <ul className="space-y-3">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Label>
                </Card>
              </div>
            ))}
          </div>
        </RadioGroup>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSkip}
            disabled={isProcessing}
          >
            Skip for now
          </Button>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Continue to Payment
              </>
            )}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            🔒 Your payment information is secure and encrypted. We use Stripe for payment processing.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                What is a credit?
              </h4>
              <p className="text-gray-600 text-sm">
                One credit allows you to unlock one executive profile, giving you access to their full details, contact information, and downloadable CV.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Do credits expire?
              </h4>
              <p className="text-gray-600 text-sm">
                No, credits never expire. Use them whenever you find the right candidates for your board positions.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Can I buy more credits later?
              </h4>
              <p className="text-gray-600 text-sm">
                Yes, you can purchase additional credits anytime from your account dashboard.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Is there a refund policy?
              </h4>
              <p className="text-gray-600 text-sm">
                We offer a 14-day money-back guarantee on unused credits. Contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}