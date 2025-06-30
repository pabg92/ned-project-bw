"use client"

import Navbar from "@/navbar"
import Footer from "@/footer"
import SignUpForm from "@/signup-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <SignUpForm />
      <Footer />
    </div>
  )
}