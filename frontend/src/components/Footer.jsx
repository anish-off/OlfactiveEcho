import React from "react";
import ScrollAnimationWrapper from "./ui/ScrollAnimationWrapper";
import CallToAction from "./product/CallToAction";

const Footer = () => (
  <footer className="py-16 bg-white shadow-lg rounded-lg mb-16">
    <ScrollAnimationWrapper delay={0.2}>
      <div className="w-full">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-8">
          Ready to Explore?
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Join our community and embark on a journey of discovery with our unique offerings.
        </p>
        <CallToAction />
      </div>

    {/* Additional Footer Content */}
    <div className="mt-16 border-t border-gray-200 pt-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-600">
            <li><a href="/about" className="hover:text-gray-900">About Us</a></li>
            <li><a href="/services" className="hover:text-gray-900">Services</a></li>
            <li><a href="/blog" className="hover:text-gray-900">Blog</a></li>
            <li><a href="/contact" className="hover:text-gray-900">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact</h3>
          <ul className="space-y-2 text-gray-600">
            <li>Email: <a href="mailto:OlfactiveEcho@gmail.com" className="hover:text-gray-900">OlfactiveEcho@gmail.com</a></li>
            <li>Phone: <a href="tel:+919876543210" className="hover:text-gray-900">+91 98765 43210</a></li>
            <li>Address: Pillars Nagar, Erode, Tamil Nadu</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" aria-label="Facebook" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" aria-label="Twitter" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" aria-label="Instagram" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" aria-label="LinkedIn" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} OlfactiveEcho. All rights reserved.
      </div>
    </div>
    </ScrollAnimationWrapper>
  </footer>
);

export default Footer;
