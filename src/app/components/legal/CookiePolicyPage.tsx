import { motion } from 'motion/react'

interface CookiePolicyPageProps {
  onNavigateHome: () => void
}

export function CookiePolicyPage({ onNavigateHome }: CookiePolicyPageProps) {
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
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
            <p className="mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="mb-4">
              This Cookie Policy explains how Nexenova Studios ("we," "us," or "our") uses cookies and similar technologies when you visit our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
            <p className="mb-4">We use cookies for various purposes, including:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Essential website functionality</li>
              <li>Improving user experience</li>
              <li>Analytics and performance monitoring</li>
              <li>Personalizing content and advertisements</li>
              <li>Remembering your preferences and settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-medium mb-3">Essential Cookies</h3>
            <p className="mb-4">
              These cookies are necessary for the website to function properly. They enable basic features like page navigation, access to secure areas, and form submissions. The website cannot function properly without these cookies.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="mb-2"><strong>Examples:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Session management cookies</li>
                <li>Security cookies</li>
                <li>Load balancing cookies</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mb-3">Performance and Analytics Cookies</h3>
            <p className="mb-4">
              These cookies collect information about how visitors use our website, such as which pages are visited most often and if users get error messages. This helps us improve our website's performance and user experience.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="mb-2"><strong>Examples:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Google Analytics cookies</li>
                <li>Page load time measurement</li>
                <li>Error tracking cookies</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mb-3">Functionality Cookies</h3>
            <p className="mb-4">
              These cookies allow our website to remember choices you make and provide enhanced, more personal features. They may be set by us or by third-party providers whose services we have added to our pages.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="mb-2"><strong>Examples:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Theme preferences (dark/light mode)</li>
                <li>Language preferences</li>
                <li>Form data retention</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mb-3">Marketing and Advertising Cookies</h3>
            <p className="mb-4">
              These cookies are used to deliver advertisements that are more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="mb-2"><strong>Examples:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Social media tracking pixels</li>
                <li>Advertising network cookies</li>
                <li>Conversion tracking cookies</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
            <p className="mb-4">
              We may use third-party services that place cookies on your device. These include:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
              <li><strong>Social Media Platforms:</strong> For social sharing functionality</li>
              <li><strong>Content Delivery Networks:</strong> For faster content loading</li>
              <li><strong>Customer Support Tools:</strong> For live chat and support features</li>
            </ul>
            <p className="mb-4">
              These third parties have their own privacy policies and cookie practices, which we encourage you to review.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Managing Your Cookie Preferences</h2>
            <p className="mb-4">
              You have several options for managing cookies:
            </p>
            
            <h3 className="text-xl font-medium mb-3">Browser Settings</h3>
            <p className="mb-4">
              Most web browsers allow you to control cookies through their settings preferences. You can:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Block all cookies</li>
              <li>Block third-party cookies only</li>
              <li>Delete existing cookies</li>
              <li>Receive notifications when cookies are set</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Opt-Out Tools</h3>
            <p className="mb-4">
              You can opt out of certain analytics and advertising cookies using these tools:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Google Analytics Opt-out Browser Add-on</li>
              <li>Network Advertising Initiative opt-out tool</li>
              <li>Digital Advertising Alliance opt-out tool</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookie Consent</h2>
            <p className="mb-4">
              When you first visit our website, you will see a cookie notice asking for your consent to use non-essential cookies. You can:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Accept all cookies</li>
              <li>Reject non-essential cookies</li>
              <li>Customize your cookie preferences</li>
              <li>Change your preferences at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Impact of Disabling Cookies</h2>
            <p className="mb-4">
              If you choose to disable cookies, some features of our website may not function correctly:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>User preferences may not be saved</li>
              <li>Some interactive features may not work</li>
              <li>Analytics data may not be collected</li>
              <li>Personalized content may not be available</li>
            </ul>
            <p className="mb-4">
              Essential cookies cannot be disabled as they are necessary for the website to function.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Updates to This Cookie Policy</h2>
            <p className="mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. We will post the updated policy on this page and update the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
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