import { motion } from 'motion/react'
import {
  ArrowLeft,
  Copyright,
  FileText,
  Mail,
  RefreshCw,
  Smartphone,
  Wifi,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

interface TermsOfServicePageProps {
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

export function TermsOfServicePage({ onNavigateHome }: TermsOfServicePageProps) {
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
                <FileText className="h-6 w-6" />
              </span>
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                Legal
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Terms &amp; Conditions</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              The rules that govern your use of games published by Nexenova Studios.
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
              <p className="mb-0">
                By downloading or using any game published by Nexenova Studios, these terms will automatically apply to you &ndash; you should make sure therefore that you read them carefully before using the game.
              </p>
            </CardContent>
          </Card>

          <PolicySection id="intellectual-property" icon={Copyright} title="Intellectual Property &amp; Restrictions" delay={0.05}>
            <p className="mb-0">
              You&rsquo;re not allowed to copy, or modify the game, any part of the game, or our trademarks in any way. You&rsquo;re not allowed to attempt to extract the source code of the game, and you also shouldn&rsquo;t try to translate the game into other languages, or make derivative versions. The game itself, and all the trade marks, copyright, database rights and other intellectual property rights related to it, still belong to Nexenova Studios.
            </p>
          </PolicySection>

          <PolicySection id="device-security" icon={Smartphone} title="Your Device &amp; Account Security" delay={0.05}>
            <p className="mb-0">
              Our games store and process personal data that you have provided to us, in order to provide our Service. It&rsquo;s your responsibility to keep your phone and access to the game secure. We therefore recommend that you do not jailbreak or root your phone, which is the process of removing software restrictions and limitations imposed by the official operating system of your device. It could make your phone vulnerable to malware/viruses/malicious programs, compromise your phone&rsquo;s security features and it could mean that our games won&rsquo;t work properly or at all.
            </p>
          </PolicySection>

          <PolicySection id="connectivity" icon={Wifi} title="Connectivity &amp; Data Charges" delay={0.05}>
            <p>
              You should be aware that there are certain things that Nexenova Studios will not take responsibility for. Certain functions of the game will require the game to have an active internet connection. The connection can be Wi-Fi, or provided by your mobile network provider, but Nexenova Studios cannot take responsibility for the game not working at full functionality if you don&rsquo;t have access to Wi-Fi, and you don&rsquo;t have any of your data allowance left.
            </p>
            <p className="mb-0">
              If you&rsquo;re using the game outside of an area with Wi-Fi, you should remember that your terms of the agreement with your mobile network provider will still apply. As a result, you may be charged by your mobile provider for the cost of data for the duration of the connection while accessing the game, or other third party charges. In using the game, you&rsquo;re accepting responsibility for any such charges, including roaming data charges if you use the game outside of your home territory (i.e. region or country) without turning off data roaming. If you are not the bill payer for the device on which you&rsquo;re using the game, please be aware that we assume that you have received permission from the bill payer for using the game.
            </p>
          </PolicySection>

          <PolicySection id="liability" icon={FileText} title="Liability &amp; Responsibility" delay={0.05}>
            <p>
              Along the same lines, Nexenova Studios cannot always take responsibility for the way you use the game i.e. You need to make sure that your device stays charged &ndash; if it runs out of battery and you can&rsquo;t turn it on to avail the Service, Nexenova Studios cannot accept responsibility.
            </p>
            <p className="mb-0">
              With respect to Nexenova Studios&rsquo;s responsibility for your use of the game, when you&rsquo;re using the game, it&rsquo;s important to bear in mind that although we endeavour to ensure that it is updated and correct at all times, we do rely on third parties to provide information to us so that we can make it available to you. Nexenova Studios accepts no liability for any loss, direct or indirect, you experience as a result of relying wholly on this functionality of the game.
            </p>
          </PolicySection>

          <PolicySection id="updates-termination" icon={RefreshCw} title="Updates &amp; Termination" delay={0.05}>
            <p className="mb-0">
              At some point, we may wish to update the game. The games are currently available on Android &amp; iOS &ndash; the requirements for both systems (and for any additional systems we decide to extend the availability of the game to) may change, and you&rsquo;ll need to download the updates if you want to keep playing the game. Nexenova Studios does not promise that it will always update the game so that it is relevant to you and/or works with the Android &amp; iOS version that you have installed on your device. However, you promise to always accept updates to the game when offered to you. We may also wish to stop providing the game, and may terminate use of it at any time without giving notice of termination to you. Unless we tell you otherwise, upon any termination, (a) the rights and licenses granted to you in these terms will end; (b) you must stop using the game, and (if needed) delete it from your device.
            </p>
          </PolicySection>

          <PolicySection id="changes" icon={RefreshCw} title="Changes to These Terms" delay={0.05}>
            <p className="mb-0">
              We may update our Terms and Conditions from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Terms and Conditions on this page. These changes are effective immediately after they are posted on this page.
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
                  <h3 className="text-lg font-semibold mb-1">Questions about these terms?</h3>
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
