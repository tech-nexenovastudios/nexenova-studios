import { motion } from 'motion/react'

interface PrivacyPolicyPageProps {
  onNavigateHome: () => void
}

export function PrivacyPolicyPage({ onNavigateHome }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-background pt-16">{/* Add padding-top to account for fixed navigation */}

      {/* Content */}
      <motion.main 
        className="container mx-auto px-4 py-12 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to Nexenova Studios ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p>
              If you have any questions or concerns about this Privacy Policy or our practices with regard to your personal information, please contact us at support@nexenovastudios.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mb-3">Personal Information</h3>
            <p className="mb-4">
              We may collect personal information that you voluntarily provide to us when:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You contact us through our website contact form</li>
              <li>You subscribe to our newsletter or marketing communications</li>
              <li>You participate in surveys or promotions</li>
              <li>You apply for employment with us</li>
            </ul>
            
            <h3 className="text-xl font-medium mb-3">Automatically Collected Information</h3>
            <p className="mb-4">
              We automatically collect certain information when you visit our website, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>IP address and location data</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide, operate, and maintain our services</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send you marketing and promotional communications (with your consent)</li>
              <li>Analyze usage patterns to improve our website and services</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>With service providers who assist us in operating our business</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or acquisition</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your personal information</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our website. For detailed information about our use of cookies, please see our Cookie Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links</h2>
            <p className="mb-4">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites and encourage you to review their privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="mb-2"><strong>Email:</strong> support@nexenovastudios.com</p>
              <p><strong>Address:</strong> India</p>
            </div>
          </section>
        </div>
      </motion.main>
    </div>
  )
}