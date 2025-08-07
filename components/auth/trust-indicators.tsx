'use client';

import { Shield, Users, Star, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustIndicatorsProps {
  variant?: 'compact' | 'full';
  className?: string;
  showTestimonial?: boolean;
}

export default function TrustIndicators({ 
  variant = 'compact', 
  className,
  showTestimonial = false 
}: TrustIndicatorsProps) {
  const stats = [
    { icon: Users, label: '500+ Verified Executives', value: '500+' },
    { icon: Star, label: '4.8/5 Average Rating', value: '4.8' },
    { icon: Award, label: 'Board-Ready Candidates', value: '98%' },
    { icon: TrendingUp, label: 'Successful Placements', value: '200+' },
  ];

  const testimonials = [
    {
      quote: "Found our perfect NED in just 3 days. The quality of candidates is exceptional.",
      author: "Sarah Johnson",
      role: "CEO, TechStart Ltd",
      rating: 5,
    },
    {
      quote: "Board Champions made our board recruitment process incredibly efficient.",
      author: "Michael Chen",
      role: "CFO, Global Finance Corp",
      rating: 5,
    },
    {
      quote: "The platform's filtering saved us weeks of searching. Highly recommended!",
      author: "Emma Williams",
      role: "Head of Talent, Innovation Inc",
      rating: 5,
    },
  ];

  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-6 text-sm", className)}>
        <div className="flex items-center gap-2 text-gray-600">
          <Shield className="h-4 w-4 text-green-500" />
          <span>Secure & Encrypted</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-4 w-4 text-blue-500" />
          <span>500+ Executives</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>4.8/5 Rating</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
            >
              <Icon className="h-8 w-8 text-[#6b93ce] mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Testimonial Carousel */}
      {showTestimonial && (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Trusted by Leading Companies
            </h3>
          </div>
          <div className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#6b93ce] rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.author.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-2">"{testimonial.quote}"</p>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{testimonial.author}</div>
                      <div className="text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm">Bank-level encryption</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm">GDPR compliant</span>
        </div>
      </div>
    </div>
  );
}