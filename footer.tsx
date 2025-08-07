import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#4a4a4a] to-[#3a3a3a] text-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Logo and About */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.svg" alt="BoardChampions" width={180} height={40} className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-gray-300 mb-8 leading-relaxed">
              BoardChampions connects businesses with expert talent for board, fractional, and project-based roles.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="w-10 h-10 bg-[#9eb4d8] rounded-full flex items-center justify-center hover:bg-[#8ea4c8] hover:scale-110 transition-all duration-300 shadow-lg"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-[#9eb4d8] rounded-full flex items-center justify-center hover:bg-[#8ea4c8] hover:scale-110 transition-all duration-300 shadow-lg"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-[#9eb4d8] rounded-full flex items-center justify-center hover:bg-[#8ea4c8] hover:scale-110 transition-all duration-300 shadow-lg"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-[#9eb4d8] rounded-full flex items-center justify-center hover:bg-[#8ea4c8] hover:scale-110 transition-all duration-300 shadow-lg"
              >
                <Youtube className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-akrive-grotesk font-bold text-xl mb-8 text-[#9eb4d8] uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm">
                  Board Appointments
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm">
                  Fractional Experts
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm">
                  NED Positions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm">
                  Industry Sectors
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm">
                  Project Contracts
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-akrive-grotesk font-bold text-xl mb-8 text-[#9eb4d8] uppercase tracking-wider">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm">
                  Our Process
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-akrive-grotesk font-bold text-xl mb-8 text-[#9eb4d8] uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-[#9eb4d8] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">Barrington House, Leake Rd, Costock, Loughborough LE12 6XA</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-[#9eb4d8] flex-shrink-0" />
                <Link href="tel:08453313031" className="text-gray-300 hover:text-white transition-colors">
                  0845 331 3031
                </Link>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-[#9eb4d8] flex-shrink-0" />
                <Link
                  href="mailto:info@boardchampions.com"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  info@boardchampions.com
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600/30 mt-16 pt-10 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} BoardChampions. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-all duration-300 border-b border-transparent hover:border-white pb-1">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition-all duration-300 border-b border-transparent hover:border-white pb-1">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-white transition-all duration-300 border-b border-transparent hover:border-white pb-1">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
