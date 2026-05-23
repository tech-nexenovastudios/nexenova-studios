import { motion } from 'motion/react'
import {
  ArrowLeft,
  Baby,
  Cookie,
  Database,
  FileSearch,
  Link as LinkIcon,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  Trash2,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

interface PrivacyPolicyPageProps {
  onNavigateHome: () => void
}

interface SectionProps {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  delay?: number
  children: React.ReactNode
}

function PolicySection({ id, icon: Icon, title, delay = 0, children }: SectionProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
            <Icon className="h-5 w-5" />
          </span>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:leading-relaxed prose-headings:font-semibold">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function PrivacyPolicyPage({ onNavigateHome }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateHome}
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Shield className="h-6 w-6" />
              </span>
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                Legal
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              How Nexenova Studios collects, uses, and protects your information when you play our games.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Last updated:</span> May 23, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="space-y-6"
        >
          <Card className="border-border/60 bg-muted/30">
            <CardContent className="pt-6 prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed">
              <p>
                Nexenova Studios builds mobile games as Freemium games. This SERVICE is provided by Nexenova Studios at no cost and is intended for use as is.
              </p>
              <p>
                This page is used to inform visitors regarding our policies with the collection, use, and disclosure of Personal Information if anyone decided to use our Service.
              </p>
              <p>
                If you choose to use our Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that we collect is used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.
              </p>
              <p className="mb-0">
                The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which is accessible at our games unless otherwise defined in this Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <PolicySection id="information-collection" icon={Database} title="Information Collection and Use" delay={0.05}>
            <p>
              For a better experience, while using our Service, we may require you to provide us with certain personally identifiable information, including but not limited to:
            </p>
            <ul>
              <li>Device info (model, OS, screen size)</li>
              <li>Advertising ID (AAID / IDFA)</li>
              <li>IP address (approx. location)</li>
              <li>Game progress / scores / local save data</li>
              <li>Crash logs / analytics events (e.g., level start, ad shown, IAP)</li>
            </ul>
            <p>The information that we request will be retained by us and used as described in this privacy policy.</p>
            <p>
              The games do use third party services and SDKs (including analytics, ads, backend, and crash reporting tools) that may collect information used to identify you. These services help us deliver core functionality (such as multiplayer/back-end via PlayFab), diagnostics, personalization, and monetization.
            </p>
            <p className="mb-2">Link to privacy policy of third party service providers used by our games:</p>
            <ul className="mb-0">
              <li>Google Play Services</li>
              <li>AdMob</li>
              <li>Facebook</li>
              <li>Unity</li>
              <li>PlayFab</li>
            </ul>
          </PolicySection>

          <PolicySection id="log-data" icon={FileSearch} title="Log Data" delay={0.05}>
            <p className="mb-0">
              We want to inform you that whenever you use our Service, in a case of an error in the game we collect data and information (through third party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (&ldquo;IP&rdquo;) address, device name, operating system version, the configuration of the game when utilizing our Service, the time and date of your use of the Service, and other statistics.
            </p>
          </PolicySection>

          <PolicySection id="cookies" icon={Cookie} title="Cookies" delay={0.05}>
            <p>
              Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device&rsquo;s internal memory.
            </p>
            <p className="mb-0">
              This Service does not use these &ldquo;cookies&rdquo; explicitly. However, the game may use third party code and libraries that use &ldquo;cookies&rdquo; to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.
            </p>
          </PolicySection>

          <PolicySection id="service-providers" icon={Users} title="Service Providers" delay={0.05}>
            <p>We may employ third-party companies and individuals due to the following reasons:</p>
            <ul>
              <li>To facilitate our Service;</li>
              <li>To provide the Service on our behalf;</li>
              <li>To perform Service-related services; or</li>
              <li>To assist us in analyzing how our Service is used.</li>
            </ul>
            <p className="mb-0">
              We want to inform users of this Service that these third parties have access to your Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
            </p>
          </PolicySection>

          <PolicySection id="security" icon={Lock} title="Security" delay={0.05}>
            <p className="mb-0">
              We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
            </p>
          </PolicySection>

          <PolicySection id="external-links" icon={LinkIcon} title="Links to Other Sites" delay={0.05}>
            <p className="mb-0">
              This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
            </p>
          </PolicySection>

          <PolicySection id="childrens-privacy" icon={Baby} title="Children's Privacy" delay={0.05}>
            <p className="mb-0">
              These Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.
            </p>
          </PolicySection>

          <PolicySection id="account-deletion" icon={Trash2} title="Account Deletion" delay={0.05}>
            <p>
              You have the right to request deletion of your account and associated personal data at any time. If you wish to delete your account and have your personal information removed from our systems, please contact us at{' '}
              <a href="mailto:support@nexenovastudios.com" className="font-medium text-primary underline-offset-4 hover:underline">
                support@nexenovastudios.com
              </a>{' '}
              with your account deletion request.
            </p>
            <p>When you request account deletion, we will:</p>
            <ul>
              <li>Delete your account and associated personal data from our systems</li>
              <li>Remove your game progress, scores, and save data</li>
              <li>Process your request within 30 days of receipt</li>
            </ul>
            <p>
              Please note that some information may be retained for legal or legitimate business purposes, such as transaction records required by law, or anonymized analytics data that cannot be associated with your account. Additionally, data shared with third-party service providers may be subject to their own retention policies.
            </p>
            <p className="mb-0">
              To request account deletion, please email us at{' '}
              <a
                href="mailto:support@nexenovastudios.com?subject=Account%20Deletion%20Request"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                support@nexenovastudios.com
              </a>{' '}
              with the subject line &ldquo;Account Deletion Request&rdquo; and include your account information or the email address associated with your account to help us locate and delete your data.
            </p>
          </PolicySection>

          <PolicySection id="changes" icon={RefreshCw} title="Changes to This Privacy Policy" delay={0.05}>
            <p className="mb-0">
              We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted on this page.
            </p>
          </PolicySection>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary flex-shrink-0">
                  <Mail className="h-6 w-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-1">Questions about your privacy?</h3>
                  <p className="text-sm text-muted-foreground">
                    Reach out at{' '}
                    <a href="mailto:support@nexenovastudios.com" className="font-medium text-primary hover:underline">
                      support@nexenovastudios.com
                    </a>{' '}
                    — based in India.
                  </p>
                </div>
                <Button asChild>
                  <a href="mailto:support@nexenovastudios.com">Contact Us</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
