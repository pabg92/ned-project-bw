import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's credit balance
    const { data: credits, error } = await supabaseAdmin
      .from('user_credits')
      .select('credits, total_purchased, credits_expiry_date')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no credit record exists, create one
      if (error.code === 'PGRST116') {
        const { data: newCredits, error: insertError } = await supabaseAdmin
          .from('user_credits')
          .insert({
            user_id: userId,
            credits: 0,
            total_purchased: 0
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user credits:', insertError);
          return NextResponse.json({ error: 'Failed to create credit record' }, { status: 500 });
        }

        return NextResponse.json({ 
          credits: newCredits.credits,
          total_purchased: newCredits.total_purchased,
          credits_expiry_date: newCredits.credits_expiry_date
        });
      }

      console.error('Error fetching user credits:', error);
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }

    // Check if credits are expired
    const availableCredits = credits.credits_expiry_date && 
      new Date(credits.credits_expiry_date) < new Date() ? 0 : credits.credits;

    return NextResponse.json({ 
      credits: availableCredits,
      total_purchased: credits.total_purchased,
      credits_expiry_date: credits.credits_expiry_date
    });

  } catch (error) {
    console.error('Error in GET /api/v1/user/credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}