import { motion } from 'motion/react'

interface TermsOfServicePageProps {
  onNavigateHome: () => void
}

export function TermsOfServicePage({ onNavigateHome }: TermsOfServicePageProps) {
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
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="mb-4">
              Welcome to Nexenova Studios. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
            <p className="mb-4">
              Nexenova Studios provides game development services, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>PC and console game development</li>
              <li>Mobile game development</li>
              <li>Game art and design services</li>
              <li>Game consulting and strategy</li>
              <li>Portfolio showcasing and client communication</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
            <p className="mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for maintaining the confidentiality of your account.
            </p>
            <p className="mb-4">
              You agree to accept responsibility for all activities that occur under your account and to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="mb-4">You agree not to use our services to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Violate any applicable local, state, national, or international law</li>
              <li>Transmit any harmful, threatening, abusive, or defamatory content</li>
              <li>Impersonate or attempt to impersonate Nexenova Studios or its employees</li>
              <li>Engage in any activity that disrupts or interferes with our services</li>
              <li>Upload viruses or other malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property Rights</h2>
            <p className="mb-4">
              Our services and their original content, features, and functionality are owned by Nexenova Studios and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="mb-4">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of our content without our prior written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Client Projects and Confidentiality</h2>
            <p className="mb-4">
              For client projects, separate project agreements and non-disclosure agreements (NDAs) will govern the specific terms of work, deliverables, timelines, and confidentiality requirements.
            </p>
            <p className="mb-4">
              We commit to maintaining the confidentiality of all client information and project details unless explicitly authorized to disclose or showcase such work.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Payment Terms</h2>
            <p className="mb-4">
              Payment terms for services will be specified in individual project contracts. Generally:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Payments are due according to the agreed schedule</li>
              <li>Late payments may incur additional fees</li>
              <li>Refund policies vary by project type and will be specified in contracts</li>
              <li>All prices are exclusive of applicable taxes unless stated otherwise</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall Nexenova Studios, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
            <p className="mb-4">
              Our services are provided on an "AS IS" and "AS AVAILABLE" basis. Nexenova Studios makes no representations or warranties of any kind, express or implied, as to the operation of our services or the information, content, or materials included therein.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="mb-4">
              Upon termination, your right to use our services will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Nexenova Studios operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us:
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