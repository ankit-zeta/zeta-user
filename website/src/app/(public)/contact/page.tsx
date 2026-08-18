"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const submitInquiry = useMutation(api.contact.submitContactInquiry);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await submitInquiry({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || "General Inquiry",
        message: formData.message,
      });
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Failed to submit message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-textMain">
          Contact ZetaGrow Support
        </h1>
        <p className="text-base text-textMuted">
          Have questions about program access, client opportunities, or corporate partnerships? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="card-surface p-6 space-y-4">
            <h3 className="text-base font-bold text-textMain">Communication Channels</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 text-textMuted">
                <Mail className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-textMain block">Email Support</strong>
                  <span>support@zetagrow.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-textMuted">
                <Phone className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-textMain block">Phone Inquiries</strong>
                  <span>+91 (080) 4567-8900</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-textMuted">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-textMain block">Headquarters</strong>
                  <span>ZetaGrow Technologies Pvt Ltd<br />Bengaluru, Karnataka, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 card-surface p-8">
          {success ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-textMain">Message Delivered</h3>
              <p className="text-xs text-textMuted max-w-sm mx-auto">
                Thank you for reaching out. Our support team will review your inquiry and respond within 24 hours.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="btn-secondary text-xs mt-2"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textMain">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none"
                    placeholder="e.g. Priya Patel"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textMain">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-textMain">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none"
                  placeholder="How can we assist you?"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-textMain">Message *</label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-borderSubtle text-xs focus:ring-1 focus:ring-brand-600 focus:outline-none"
                  placeholder="Provide details about your query..."
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
