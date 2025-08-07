'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUp } from '@clerk/nextjs';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Lock, Building2, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import TrustIndicators from './trust-indicators';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().min(1, 'Please select an industry'),
  companySize: z.string().min(1, 'Please select company size'),
  role: z.string().min(2, 'Your role is required'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
});

type SignupFormData = z.infer<typeof signupSchema>;

interface CombinedSignupFormProps {
  onComplete?: () => void;
  onBrowseFirst?: () => void;
}

export default function CombinedSignupForm({ onComplete, onBrowseFirst }: CombinedSignupFormProps) {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCompanyFields, setShowCompanyFields] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const email = watch('email');
  const password = watch('password');

  // Progressive disclosure - show company fields when email and password are valid
  useEffect(() => {
    const checkEmailPassword = async () => {
      const emailValid = await trigger('email');
      const passwordValid = await trigger('password');
      
      if (emailValid && passwordValid && email && password) {
        setShowCompanyFields(true);
        setEmailValidated(true);
        
        // Auto-fill company name from email domain if possible
        const domain = email.split('@')[1];
        if (domain && !watch('companyName')) {
          const companyName = domain.split('.')[0];
          setValue('companyName', companyName.charAt(0).toUpperCase() + companyName.slice(1));
        }
      }
    };

    checkEmailPassword();
  }, [email, password, trigger, setValue, watch]);

  const onSubmit = async (data: SignupFormData) => {
    if (!isLoaded || !signUp) return;

    setIsSubmitting(true);

    try {
      // Create the Clerk user
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      // Store company information in public metadata
      await signUp.update({
        unsafeMetadata: {
          companyName: data.companyName,
          industry: data.industry,
          companySize: data.companySize,
          role: data.role,
          accountType: 'company',
          onboardingCompleted: true,
        },
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Set the session
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // Store company data for later use
        sessionStorage.setItem('companyOnboarding', JSON.stringify({
          companyName: data.companyName,
          industry: data.industry,
          companySize: data.companySize,
          role: data.role,
        }));

        toast.success('Account created successfully!');
        
        // Navigate to payment selection
        router.push('/company-payment-selection');
        onComplete?.();
      } else {
        // Handle email verification
        router.push('/verify-email');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      toast.error(err.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const industries = [
    'Technology',
    'Financial Services',
    'Healthcare',
    'Retail',
    'Manufacturing',
    'Energy',
    'Real Estate',
    'Education',
    'Media & Entertainment',
    'Other',
  ];

  const companySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Account Creation Section */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Join Board Champions</h2>
            <p className="text-gray-600 mt-2">Find verified board-ready executives in minutes</p>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Business Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                {...register('email')}
                className={cn(
                  'pr-10',
                  errors.email && 'border-red-500',
                  emailValidated && !errors.email && 'border-green-500'
                )}
              />
              {emailValidated && !errors.email && (
                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Create Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                {...register('password')}
                className={cn(
                  'pr-10',
                  errors.password && 'border-red-500'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lock className="h-3 w-3" />
              <span>Your data is encrypted and secure</span>
            </div>
          </div>
        </div>

        {/* Company Details Section - Progressive Disclosure */}
        <AnimatePresence>
          {showCompanyFields && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600 pb-2">
                <Building2 className="h-4 w-4" />
                <span>Tell us about your company</span>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Corporation"
                  {...register('companyName')}
                  className={errors.companyName ? 'border-red-500' : ''}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">{errors.companyName.message}</p>
                )}
              </div>

              {/* Industry and Company Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    onValueChange={(value) => setValue('industry', value)}
                    defaultValue={watch('industry')}
                  >
                    <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-sm text-red-500">{errors.industry.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select
                    onValueChange={(value) => setValue('companySize', value)}
                    defaultValue={watch('companySize')}
                  >
                    <SelectTrigger className={errors.companySize ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.companySize && (
                    <p className="text-sm text-red-500">{errors.companySize.message}</p>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Your Role</Label>
                <Input
                  id="role"
                  placeholder="e.g., CEO, Head of Talent, HR Director"
                  {...register('role')}
                  className={errors.role ? 'border-red-500' : ''}
                />
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="space-y-3 pb-safe">
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-gradient-to-r from-[#6b93ce] to-[#5a82bd] hover:from-[#5a82bd] hover:to-[#4a72ad] text-white h-12 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onBrowseFirst}
            className="w-full h-12 text-base"
          >
            Browse profiles first
          </Button>
        </div>

        {/* Trust Indicators */}
        <TrustIndicators variant="compact" className="pt-4" />
      </form>
    </div>
  );
}