import { Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-auto text-sm">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-4 gap-16">
          <div className="flex flex-col items-start">
            <Link className="mb-4" href="#">
              <span className="text-lg font-semibold text-gray-200">CareerChain</span>
            </Link>
            <p className="text-sm leading-relaxed">Empowering Authentic Careers with Blockchain</p>
          </div>
          <div className="flex flex-col items-start">
            <h3 className="font-semibold text-gray-200 mb-4">Quick Links</h3>
            <nav className="space-y-2 flex flex-col items-start text-sm">
              <Link className="hover:text-gray-300 transition-colors" href="#">
                About
              </Link>
              <Link className="hover:text-gray-300 transition-colors" href="#">
                Services
              </Link>
              <Link className="hover:text-gray-300 transition-colors" href="#">
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex flex-col items-start">
            <h3 className="font-semibold text-gray-200 mb-4">Resources</h3>
            <nav className="space-y-2 flex flex-col items-start text-sm">
              <Link className="hover:text-gray-300 transition-colors" href="#">
                Blog
              </Link>
              <Link className="hover:text-gray-300 transition-colors" href="#">
                Whitepaper
              </Link>
              <Link className="hover:text-gray-300 transition-colors" href="#">
                FAQ
              </Link>
            </nav>
          </div>
          <div className="flex flex-col items-start">
            <h3 className="font-semibold text-gray-200 mb-4">Follow Us</h3>
            <div className="flex space-x-4 text-sm">
              <Link className="hover:text-gray-300 transition-colors" href="#">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link className="hover:text-gray-300 transition-colors" href="#">
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-800 pt-4 text-center">
        <p className="text-sm">© 2024 CareerChain Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
