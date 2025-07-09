import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from '@/lib/supabase/server-client'
import { z } from "zod"

// Validation schema
const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  newsletter: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = subscribeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, newsletter = false } = validation.data

    // Check if email already exists
    const { data: existingSubscriber } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, subscribed_to_newsletter")
      .eq("email", email)
      .single()

    if (existingSubscriber) {
      // Update existing subscriber
      const { error: updateError } = await supabaseAdmin
        .from("newsletter_subscribers")
        .update({
          subscribed_to_newsletter: newsletter || existingSubscriber.subscribed_to_newsletter,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSubscriber.id)

      if (updateError) {
        console.error("Error updating subscriber:", updateError)
        return NextResponse.json(
          { error: "Failed to update subscription" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully",
        isNew: false,
      })
    }

    // Create new subscriber
    const { error: insertError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({
        email,
        subscribed_to_newsletter: newsletter,
        source: "cta_section",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error("Error creating subscriber:", insertError)
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      )
    }

    // TODO: Send welcome email using Resend or SendGrid
    // await sendWelcomeEmail(email)

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter",
      isNew: true,
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}