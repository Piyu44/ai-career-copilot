import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, ShieldCheck, FileText, RefreshCw, HelpCircle } from "lucide-react";
import { Card, Badge, Button } from "../components/ui";
import { usePageMeta } from "../hooks";

export function TermsPage() {
  usePageMeta("Terms & Conditions — CareerDost AI");
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-ink-400 hover:text-brand-300">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="font-display text-3xl font-bold text-white">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-ink-400">Last updated: August 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-300">
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using CareerDost ("Service"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">2. Description of Service</h2>
            <p>
              CareerDost provides AI-assisted resume analysis, job match scoring, cover letter generation, and interview simulation tools.
              Scores and suggestions generated are advisory and for personal career preparation.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">3. Subscription & Payments</h2>
            <p>
              Payments for Starter and Pro plans are processed securely through Razorpay.
              Credits are allocated immediately upon successful transaction confirmation.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">4. User Content</h2>
            <p>
              You retain all rights to the resume data and job descriptions you submit. We do not sell or share your personal resume content with third-party recruiters without your consent.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  usePageMeta("Privacy Policy — CareerDost AI");
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-ink-400 hover:text-brand-300">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="font-display text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink-400">Last updated: August 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-300">
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">1. Information We Collect</h2>
            <p>
              We collect your name, email address, and authentication credentials when you register via Firebase Authentication.
              We also store your uploaded resume data and job analyses for your personal dashboard access.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">2. How We Use Information</h2>
            <p>
              Your data is used solely to provide AI analysis, track your job applications, and allocate your credit balance.
              Payment information is handled directly by Razorpay's PCI-DSS compliant infrastructure; we do not store your credit card numbers or banking passwords.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">3. Data Security</h2>
            <p>
              All communication is encrypted using 256-bit SSL/TLS encryption. Your Firebase data is protected by strict user-level security rules.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function RefundPolicyPage() {
  usePageMeta("Cancellation & Refund Policy — CareerDost AI");
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-ink-400 hover:text-brand-300">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="font-display text-3xl font-bold text-white">Cancellation & Refund Policy</h1>
        <p className="mt-2 text-sm text-ink-400">Last updated: August 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-300">
          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">1. Refund Eligibility</h2>
            <p>
              We offer a 7-day money-back guarantee for subscription plans if you encounter technical difficulties or are unsatisfied with the AI analysis tools.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">2. Cancellation Policy</h2>
            <p>
              You can cancel your subscription at any time from your Account Settings. Upon cancellation, your remaining credits will stay active until the end of your billing cycle.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">3. Processing Refunds</h2>
            <p>
              Refund requests can be submitted to our support team at <strong className="text-white">support@careerdost.in</strong> with your Razorpay Payment ID.
              Approved refunds are credited back to the original payment source within 5–7 working days per standard banking processing timelines.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ContactUsPage() {
  usePageMeta("Contact Us — CareerDost AI");
  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-ink-400 hover:text-brand-300">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="font-display text-3xl font-bold text-white">Contact Us</h1>
        <p className="mt-2 text-sm text-ink-400">We're here to help you get hired.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card className="p-6 flex flex-col items-start gap-3">
            <div className="rounded-xl bg-brand-500/20 p-3 text-brand-300">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Email Support</h3>
              <p className="mt-1 text-xs text-ink-400">Response within 24 hours</p>
              <a href="mailto:support@careerdost.in" className="mt-2 inline-block text-sm font-semibold text-brand-300 hover:underline">
                support@careerdost.in
              </a>
            </div>
          </Card>

          <Card className="p-6 flex flex-col items-start gap-3">
            <div className="rounded-xl bg-emerald-500/20 p-3 text-emerald-300">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Headquarters</h3>
              <p className="mt-1 text-xs text-ink-400">CareerDost India</p>
              <p className="mt-2 text-sm text-ink-300">Bengaluru, Karnataka, India</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
