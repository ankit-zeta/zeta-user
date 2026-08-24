"use client";

import React from "react";
import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-2 border-b border-borderSubtle pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-textMain">Security Policy</h1>
        <p className="text-xs text-textMuted">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="prose prose-sm max-w-none text-textMuted space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-bold text-textMain">1. Security Commitment</h2>
          <p>ZetaGrow takes the security of our Platform, Users, and data seriously. We implement industry-standard security practices across our infrastructure, application, and processes to protect your data and ensure platform integrity.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">2. Infrastructure & Network Security</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li><strong>Cloud Provider:</strong> Hosted on SOC 2 Type II certified infrastructure (AWS/GCP).</li>
            <li><strong>Network Segmentation:</strong> VPC isolation, private subnets, security groups, NACLs.</li>
            <li><strong>DDoS Protection:</strong> Cloudflare / AWS Shield Standard for volumetric attack mitigation.</li>
            <li><strong>WAF:</strong> Web Application Firewall with OWASP Core Rule Set, custom rules for API protection.</li>
            <li><strong>Network Monitoring:</strong> 24/7 flow logs, VPC flow logs, intrusion detection alerts.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">3. Application Security</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li><strong>Authentication:</strong> PBKDF2 (10,000 iterations, SHA-256) password hashing; secure session tokens with 30-day expiry; optional 2FA (TOTP).</li>
            <li><strong>Authorization:</strong> Role-Based Access Control (RBAC); principle of least privilege; attribute-based access for Work Marketplace.</li>
            <li><strong>Session Management:</strong> Secure, HttpOnly, SameSite=Strict cookies; automatic expiry; concurrent session limits.</li>
            <li><strong>Input Validation:</strong> Server-side validation on all mutations; Zod schema validation; parameterized queries (Convex).</li>
            <li><strong>Output Encoding:</strong> Context-aware output encoding to prevent XSS; CSP headers.</li>
            <li><strong>Rate Limiting:</strong> Per-user and per-IP rate limits on auth, API, and sensitive endpoints.</li>
            <li><strong>Brute-Force Protection:</strong> 8 failed login attempts  -  15-minute account lockout.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">4. Data Protection</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li><strong>Encryption in Transit:</strong> TLS 1.3 enforced for all connections; HSTS preloaded.</li>
            <li><strong>Encryption at Rest:</strong> AES-256 for databases, backups, and file storage (Convex managed).</li>
            <li><strong>Key Management:</strong> Cloud KMS with automatic rotation; secrets in secret manager (not in code).</li>
            <li><strong>Password Hashing:</strong> PBKDF2-SHA256, 10,000 iterations, unique salt per user.</li>
            <li><strong>Secrets Management:</strong> API keys, secrets in Convex secret manager; never in code or logs.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">5. Access Control & Monitoring</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li><strong>RBAC:</strong> Granular roles (user, content_admin, finance_admin, work_admin, super_admin).</li>
            <li><strong>Admin Access:</strong> MFA enforced for all admin accounts; just-in-time access for production.</li>
            <li><strong>Audit Logging:</strong> Immutable audit logs for all admin actions, privilege changes, data exports.</li>
            <li><strong>Session Monitoring:</strong> Concurrent session limits; suspicious activity alerts (geo-impossible, new device).</li>
            <li><strong>Audit Trail:</strong> Immutable logs for all admin actions, privilege changes, user status changes.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">6. Vulnerability Management</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li><strong>Dependency Scanning:</strong> Automated SCA (Software Composition Analysis) in CI/CD; automated PRs for vulnerable dependencies.</li>
            <li><strong>SAST/DAST:</strong> Static and dynamic analysis in CI/CD pipeline.</li>
            <li><strong>Penetration Testing:</strong> Annual third-party penetration test; remediation within 30 days for critical/high findings.</li>
            <li><strong>Bug Bounty:</strong> Coordinated vulnerability disclosure via <a href="mailto:security@zetagrow.com" className="text-brand-700 underline">security@zetagrow.com</a>; responsible disclosure rewarded.</li>
            <li><strong>Patch Management:</strong> Critical patches applied within 48 hours; automated OS/base image updates.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">7. Incident Response</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li><strong>Plan:</strong> Documented IR plan with roles, communication plan, escalation procedures.</li>
            <li><strong>Detection:</strong> SIEM with alerting on anomalous behavior, failed auth spikes, data exfiltration patterns.</li>
            <li><strong>Containment:</strong> Automated isolation of compromised accounts/instances.</li>
            <li><strong>Notification:</strong> Affected Users notified within 72 hours where required by law (DPDP Act, GDPR).</li>
            <li><strong>Post-Incident:</strong> Root cause analysis, remediation tracking, lessons learned documented.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">8. Business Continuity & Disaster Recovery</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li><strong>Backups:</strong> Automated daily encrypted backups; point-in-time recovery (7-day retention).</li>
            <li><strong>RPO/RTO:</strong> RPO &lt; 1 hour, RTO &lt; 4 hours for critical services.</li>
            <li><strong>Multi-AZ:</strong> Deployed across multiple availability zones.</li>
            <li><strong>DR Testing:</strong> Annual DR drill; runbook validation.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">9. Third-Party Risk</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li><strong>Vendor Assessment:</strong> Security review for all critical vendors (Convex, Razorpay, cloud providers).</li>
            <li><strong>DPAs:</strong> Data Processing Agreements with all subprocessors.</li>
            <li><strong>SOC 2:</strong> Preference for SOC 2 Type II certified vendors.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">10. Responsible Disclosure</h2>
          <p>We welcome responsible vulnerability reports. Please email <a href="mailto:security@zetagrow.com" className="text-brand-700 underline">security@zetagrow.com</a> with:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Description of the vulnerability</li>
            <li>Steps to reproduce</li>
            <li>Potential impact</li>
            <li>Proof of concept (if available)</li>
          </ul>
          <p>We commit to:</p>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>Acknowledge receipt within 2 business days</li>
            <li>Provide remediation timeline within 10 business days</li>
            <li>Credit reporters (with permission) in our Hall of Fame</li>
            <li>Coordinate public disclosure after remediation</li>
          </ul>
          <p><strong>Do not</strong> access unauthorized data, disrupt services, or test on production without authorization.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">11. Compliance</h2>
          <ul className="list-disc pl-6 space-y-1 text-textMuted">
            <li>DPDP Act 2023 (India)  -  data protection</li>
            <li>IT Act 2000 / IT Rules 2021  -  intermediary guidelines</li>
            <li>Income Tax Act  -  TDS, financial reporting</li>
            <li>GST Act  -  tax compliance</li>
            <li>PCI DSS SAQ A  -  via Razorpay (payment processing)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-textMain">12. Contact</h2>
          <p>Security concerns: <a href="mailto:security@zetagrow.com" className="text-brand-700 underline">security@zetagrow.com</a> (PGP key available on request).</p>
        </section>

        <div className="pt-8 border-t border-borderSubtle">
          <p className="text-xs text-textMuted">
            <Link href="/terms" className="text-brand-700 underline hover:text-brand-800">Terms of Service</Link> &middot;{" "}
            <Link href="/privacy" className="text-brand-700 underline hover:text-brand-800">Privacy Policy</Link> &middot;{" "}
            <Link href="/acceptable-use" className="text-brand-700 underline hover:text-brand-800">Acceptable Use Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
