import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <Link to="/" className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
        ← Back to home
      </Link>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="text-gradient">Privacy Policy</span>
          </h1>
          <p className="text-sm text-muted-foreground">Last Updated: February 19, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed">
          <p>
            Welcome to Zyquence ("Company," "we," "our," or "us").
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, applications, and services (collectively, the "Services").
            By using Zyquence, you agree to the terms of this Privacy Policy.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>We may collect the following categories of information:</p>

            <h3 className="text-base font-medium text-foreground">A. Personal Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name</li>
              <li>Email address</li>
              <li>Account login credentials</li>
              <li>Profile information</li>
              <li>Uploaded content (including images, schedules, or other files)</li>
              <li>Messages or communications you send to us</li>
            </ul>

            <h3 className="text-base font-medium text-foreground">B. Images and User-Generated Content</h3>
            <p>If you use Zyquence features that allow you to upload photos (for example, AI image generation or styling tools), we may collect and process:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Photos of you</li>
              <li>Photos of clothing or other items</li>
              <li>Generated images produced by our AI systems</li>
            </ul>
            <p>These images are used solely to provide the requested functionality. We do not sell biometric identifiers.</p>

            <h3 className="text-base font-medium text-foreground">C. Location Information</h3>
            <p>If you enable location features, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Approximate or precise location data</li>
              <li>Device location signals</li>
              <li>Places you search or interact with</li>
            </ul>
            <p>Location data is used to power maps, recommendations, and location-based tools. You may disable location permissions at any time in your device settings.</p>

            <h3 className="text-base font-medium text-foreground">D. Education Information</h3>
            <p>If you use academic planning features, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Class schedules</li>
              <li>Academic planning inputs</li>
              <li>Uploaded school documents</li>
            </ul>
            <p>This information is used only to provide planning functionality.</p>

            <h3 className="text-base font-medium text-foreground">E. Usage and Device Information</h3>
            <p>We automatically collect certain information when you use the Services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device type</li>
              <li>Operating system</li>
              <li>Pages viewed</li>
              <li>Interactions with features</li>
              <li>Log data and analytics information</li>
            </ul>

            <h3 className="text-base font-medium text-foreground">F. Inferences and Personalization</h3>
            <p>We may analyze your activity to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Personalize content</li>
              <li>Improve recommendations</li>
              <li>Improve AI features</li>
              <li>Enhance user experience</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>We use information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and operate the Services</li>
              <li>Create and manage user accounts</li>
              <li>Deliver AI features and generated content</li>
              <li>Provide location-based functionality</li>
              <li>Improve our platform and technology</li>
              <li>Personalize user experience</li>
              <li>Respond to customer support requests</li>
              <li>Maintain security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Sharing of Information</h2>
            <p>We do not sell personal information. We may share information with:</p>

            <h3 className="text-base font-medium text-foreground">Service Providers</h3>
            <p>Third-party vendors who help operate the platform, such as:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cloud hosting providers</li>
              <li>AI processing providers</li>
              <li>Analytics tools</li>
              <li>Infrastructure and database providers</li>
              <li>Payment processors (if applicable)</li>
            </ul>
            <p>These providers may only use information to perform services for us.</p>

            <h3 className="text-base font-medium text-foreground">Legal Requirements</h3>
            <p>We may disclose information if required to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Comply with law</li>
              <li>Respond to legal requests</li>
              <li>Protect rights or safety</li>
              <li>Prevent fraud or abuse</li>
            </ul>

            <h3 className="text-base font-medium text-foreground">Business Transfers</h3>
            <p>If Zyquence is involved in a merger, acquisition, or sale, user information may be transferred.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. AI Processing and Automated Features</h2>
            <p>Zyquence uses artificial intelligence systems to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Generate images</li>
              <li>Provide recommendations</li>
              <li>Assist with planning tools</li>
              <li>Personalize content</li>
            </ul>
            <p>AI outputs may not always be accurate, and users should use discretion when relying on generated results. We do not use uploaded images to identify individuals without consent.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Data Retention</h2>
            <p>We retain personal information as long as your account remains active or as needed to provide services. You may request deletion of your data at any time.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Your Privacy Rights</h2>
            <p>Depending on your location, you may have rights including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your data</li>
              <li>Restrict or object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>
            <p>To exercise rights, contact us at: <a href="mailto:privacy@zyquence.com" className="text-primary hover:underline">privacy@zyquence.com</a></p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. California Privacy Rights (CCPA/CPRA)</h2>
            <p>California residents have rights to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Know what personal information is collected</li>
              <li>Request deletion</li>
              <li>Correct inaccurate information</li>
              <li>Opt-out of sale or sharing (we do not sell data)</li>
              <li>Limit use of sensitive personal information</li>
            </ul>
            <p>Requests may be submitted via email.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Sensitive Personal Information</h2>
            <p>We may process limited sensitive information such as:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account login credentials</li>
              <li>Location data</li>
              <li>Images you upload</li>
            </ul>
            <p>We use this information only to provide requested services.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Children's Privacy</h2>
            <p>Zyquence is not directed to children under 13. We do not knowingly collect information from children under 13. If we become aware of such data, we will delete it.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">10. Security</h2>
            <p>We implement reasonable safeguards to protect information, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encryption</li>
              <li>Access controls</li>
              <li>Secure infrastructure</li>
              <li>Authentication systems</li>
            </ul>
            <p>However, no system is completely secure.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">11. International Users</h2>
            <p>If you access Zyquence from outside the United States, your information may be transferred to and processed in the United States.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">12. Third-Party Services</h2>
            <p>Zyquence may integrate with third-party services such as:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Maps providers</li>
              <li>Authentication providers</li>
              <li>Cloud services</li>
              <li>AI providers</li>
            </ul>
            <p>These services have their own privacy policies.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">13. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Updates will be posted with a revised "Last Updated" date. Continued use of the Services constitutes acceptance of changes.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">14. Contact Information</h2>
            <p>If you have questions about this Privacy Policy:</p>
            <p className="font-medium text-foreground">Zyquence</p>
            <p>Email: <a href="mailto:zyquence.info@gmail.com" className="text-primary hover:underline">zyquence.info@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
