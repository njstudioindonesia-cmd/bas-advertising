"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

export default function Hubungi() {
  return (
    <div className="bg-white min-h-screen">
      <section className="pt-20 md:pt-40 pb-28 md:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
          
          {/* LEFT - TEXT & INFO */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col justify-center"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-accent mb-6 block">Contact Us</span>
            <h1 className="font-display text-5xl md:text-6xl text-brand-dark mb-8 tracking-tight">
              Let's create <br/> something great.
            </h1>
            <p className="text-lg text-gray-500 mb-12 max-w-md leading-relaxed font-light">
              Whether you have a fully formed project or just a rough idea, our team is ready to bring it to life with precision and care.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin className="text-brand-dark" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-1">Studio & Workshop</h3>
                  <p className="text-gray-500 font-light leading-relaxed">Jl. Percetakan Modern No.88<br/>Jakarta Selatan 12345</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Phone className="text-brand-dark" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-1">Phone / WhatsApp</h3>
                  <p className="text-gray-500 font-light">+62 812 3456 7890</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Mail className="text-brand-dark" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark mb-1">Email Inquiries</h3>
                  <p className="text-gray-500 font-light">hello@basadvertising.com</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT - FORM */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="bg-[#F8F9FA] rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold mb-8 text-brand-dark tracking-tight">Send a message</h2>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input type="text" className="w-full bg-white border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input type="text" className="w-full bg-white border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all" placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" className="w-full bg-white border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all" placeholder="john@example.com" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Details</label>
                  <textarea rows={5} className="w-full bg-white border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark transition-all resize-none" placeholder="Tell us about your printing needs..."></textarea>
                </div>
                
                <button type="button" className="btn-primary w-full flex justify-center items-center gap-2 py-4">
                  Submit Request <ArrowUpRight size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
