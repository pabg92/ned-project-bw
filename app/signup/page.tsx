"use client"

import Navbar from "@/navbar"
import Footer from "@/footer"
import StreamlinedSignUpForm from "@/streamlined-signup-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <StreamlinedSignUpForm />
      <Footer />
    </div>
  )
}