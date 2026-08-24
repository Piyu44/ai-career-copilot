import React, { Suspense, useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProviders, useAuth } from "./context";
import { GuestOnly, Protected, PublicLayout } from "./components/layout";
import { Logo } from "./components/ui";

/* Lazy-loaded routes = code splitting per page (perf requirement).
   Sitemap-ready architecture: every public route below maps 1:1 to a URL. */
const Landing = React.lazy(() => import("./pages/Landing"));
const FeaturesPage = React.lazy(() => import("./pages/public").then((m) => ({ default: m.FeaturesPage })));
const PricingPage = React.lazy(() => import("./pages/public").then((m) => ({ default: m.PricingPage })));
const LoginPage = React.lazy(() => import("./pages/public").then((m) => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import("./pages/public").then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import("./pages/public").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = React.lazy(() => import("./pages/public").then((m) => ({ default: m.ResetPasswordPage })));
const NotFoundPage = React.lazy(() => import("./pages/public").then((m) => ({ default: m.NotFoundPage })));
const TermsPage = React.lazy(() => import("./pages/legal").then((m) => ({ default: m.TermsPage })));
const PrivacyPolicyPage = React.lazy(() => import("./pages/legal").then((m) => ({ default: m.PrivacyPolicyPage })));
const RefundPolicyPage = React.lazy(() => import("./pages/legal").then((m) => ({ default: m.RefundPolicyPage })));
const ContactUsPage = React.lazy(() => import("./pages/legal").then((m) => ({ default: m.ContactUsPage })));

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const JobMatch = React.lazy(() => import("./pages/JobMatch"));
const ResumeToolsPage = React.lazy(() => import("./pages/ResumeTools").then((m) => ({ default: m.ResumeToolsPage })));
const AtsCheckerPage = React.lazy(() => import("./pages/ResumeTools").then((m) => ({ default: m.AtsCheckerPage })));
const CoverLetterPage = React.lazy(() => import("./pages/CoverLetter"));
const InterviewPage = React.lazy(() => import("./pages/Interview"));
const ApplicationsPage = React.lazy(() => import("./pages/Applications"));
const SettingsPage = React.lazy(() => import("./pages/Settings"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="animate-pulse-soft"><Logo /></div>
    </div>
  );
}

/**
 * Root entry gatekeeper:
 * - Unauthenticated visitors immediately see the Login page.
 * - Authenticated visitors are automatically routed to their Account Dashboard.
 */
function AuthGate() {
  const { user, initializing } = useAuth();
  if (initializing) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AppProviders>
      <HashRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Root entry — guests see login first, logged-in users see account */}
            <Route path="/" element={<AuthGate />} />

            {/* Public marketing & legal pages */}
            <Route element={<PublicLayout />}>
              <Route path="/landing" element={<Landing />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/refund" element={<RefundPolicyPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Auth (guest only — logged in users are redirected to their account) */}
            <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
            <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
            <Route path="/reset-password" element={<GuestOnly><ResetPasswordPage /></GuestOnly>} />

            {/* Authenticated app / account area */}
            <Route element={<Protected />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/job-match" element={<JobMatch />} />
              <Route path="/resume-tools" element={<ResumeToolsPage />} />
              <Route path="/cover-letter" element={<CoverLetterPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/ats-checker" element={<AtsCheckerPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </AppProviders>
  );
}
