'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { CheckCircle, CreditCard, Zap, Shield, Users, ArrowRight, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  price: string;
  priceDetail: string;
  features: string[];
  recommended?: boolean;
  icon: React.ReactNode;
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'payasyougo',
    name: 'Pay as you go',
    description: 'Perfect for occasional hiring',
    price: '£50',
    priceDetail: 'per profile unlock',
    features: [
      'Unlock profiles individually',
      'No monthly commitment',
      'Access to all features',
      'Email support',
    ],
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: 'subscription',
    name: 'Monthly Subscription',
    description: 'Best for active hiring teams',
    price: '£399',
    priceDetail: 'per month',
    features: [
      'Unlimited profile unlocks',
      'Priority support',
      'Advanced search filters',
      'Team collaboration tools',
      'Export capabilities',
    ],
    recommended: true,
    icon: <Sparkles className="h-6 w-6" />,
  },
];

export default function CompanyPaymentSelectionPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [selectedOption, setSelectedOption] = useState<string>('subscription');
  const [isProcessing, setIsProcessing] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    // Retrieve company data from session storage
    const storedData = sessionStorage.getItem('companyOnboarding');
    if (storedData) {
      setCompanyData(JSON.parse(storedData));
    }
  }, []);

  const handleContinue = async () => {
    if (!selectedOption) {
      toast.error('Please select a payment option');
      return;
    }

    setIsProcessing(true);

    try {
      // Store selected payment method
      const response = await fetch('/api/user/payment-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: selectedOption,
          companyData: companyData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save payment preference');
      }

      // For subscription, redirect to Stripe checkout
      if (selectedOption === 'subscription') {
        // TODO: Implement Stripe subscription checkout
        toast.success('Redirecting to secure payment...');
        // For now, simulate success
        setTimeout(() => {
          router.push('/search?welcome=true');
        }, 1500);
      } else {
        // For pay-as-you-go, go directly to search
        toast.success('Account setup complete!');
        router.push('/search?welcome=true');
      }
    } catch (error) {
      console.error('Payment preference error:', error);
      toast.error('Failed to save payment preference');
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    router.push('/search?limited=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Progress Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900 hidden sm:inline">Account Created</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300" />
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900 hidden sm:inline">Choose Access</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300" />
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-600">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600 hidden sm:inline">Start Searching</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Message */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to Board Champions{companyData?.companyName ? `, ${companyData.companyName}!` : '!'}
            </h1>
            <p className="text-xl text-gray-600">
              Choose how you'd like to access our network of verified executives
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-10">
            <div className="flex items-center text-gray-600">
              <Shield className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-sm">500+ Verified Executives</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              <span className="text-sm">Instant Access</span>
            </div>
          </div>

          {/* Payment Options */}
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
              {paymentOptions.map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={cn(
                      'relative p-6 cursor-pointer transition-all',
                      selectedOption === option.id
                        ? 'ring-2 ring-blue-600 shadow-lg'
                        : 'hover:shadow-md',
                      option.recommended && 'border-blue-200'
                    )}
                    onClick={() => setSelectedOption(option.id)}
                  >
                    {option.recommended && (
                      <Badge className="absolute -top-3 right-4 bg-blue-600 text-white">
                        Recommended
                      </Badge>
                    )}

                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="sr-only"
                    />
                    <Label htmlFor={option.id} className="cursor-pointer">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                              {option.icon}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {option.name}
                              </h3>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-gray-900">
                            {option.price}
                          </span>
                          <span className="text-gray-600">{option.priceDetail}</span>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2">
                          {option.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Label>
                  </Card>
                </motion.div>
              ))}
            </div>
          </RadioGroup>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
            <Button
              variant="outline"
              size="lg"
              onClick={handleSkip}
              disabled={isProcessing}
              className="order-2 sm:order-1 h-12 sm:h-auto"
            >
              Skip for now - browse only
            </Button>
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={isProcessing}
              className={cn(
                'order-1 sm:order-2',
                'bg-gradient-to-r from-[#6b93ce] to-[#5a82bd]',
                'hover:from-[#5a82bd] hover:to-[#4a72ad]',
                'text-white shadow-lg hover:shadow-xl',
                'min-w-[200px] h-12 sm:h-auto'
              )}
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <CreditCard className="h-5 w-5" />
                  </motion.div>
                  Processing...
                </>
              ) : (
                <>
                  {selectedOption === 'subscription' ? 'Continue to Payment' : 'Get Started'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              Your payment information is secure and encrypted via Stripe
            </p>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">
                <strong>14-day money-back guarantee</strong> - Try Board Champions risk-free
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}