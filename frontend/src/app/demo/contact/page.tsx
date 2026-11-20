import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { ContactForm } from '@/components/shared/ContactForm';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createContactJsonLd, createWebPageJsonLd } from '@/lib/schema';
import { Mail, MessageSquareText, ShieldCheck, MapPin } from 'lucide-react';

export const metadata = createPageMetadata({
  title: 'Contact BITAINTEL Trust Team',
  description:
    'Contact the BITAINTEL regulatory analysts and procurement integration specialists for verification inquiries and enterprise onboarding.',
  pathname: '/contact',
  keywords: ['Contact BITAINTEL', 'Verification Support', 'Procurement Advisory', 'Vendor Audit Inquiries'],
});

export default function ContactPage() {
  const contactSchema = createContactJsonLd();
  const breadcrumbSchema = createWebPageJsonLd({
    title: 'Contact BITAINTEL Trust Team',
    description:
      'Contact the BITAINTEL regulatory analysts and procurement integration specialists for verification inquiries and enterprise onboarding.',
    pathname: '/contact',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Contact', url: '/contact' },
    ],
  });

  return (
    <section className="py-12 sm:py-20">
      <JsonLd schema={[contactSchema, breadcrumbSchema]} />
      <Container>
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow">Direct Contact Channel</span>
            <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Let&apos;s talk about <span className="text-primary-700">business trust.</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
              Have questions regarding statutory checkpoints, enterprise ERP API integration, or auditing your company profile? Reach out to our specialist team.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            {/* Contact Channels Column */}
            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  title: 'Enterprise Onboarding',
                  text: 'Connect with an enterprise integration analyst for custom supply chain screening.',
                  sub: 'enterprise@bitaintel.example',
                },
                {
                  icon: ShieldCheck,
                  title: 'Methodology & Auditing',
                  text: 'Questions about MCA filings, GSTN reconciliation, or re-verification procedures.',
                  sub: 'audit@bitaintel.example',
                },
                {
                  icon: MessageSquareText,
                  title: 'Technical API Support',
                  text: 'ERP webhook connectivity and programmatic scoring verification documentation.',
                  sub: 'api-support@bitaintel.example',
                },
              ].map((item) => (
                <Card key={item.title} variant="bento" className="p-6">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-600 mb-3">
                    <item.icon className="size-5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{item.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.text}</p>
                  <span className="mt-3 block text-xs font-semibold text-primary-700">
                    {item.sub}
                  </span>
                </Card>
              ))}

              <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 text-xs text-slate-500 backdrop-blur-md space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <MapPin className="size-4 text-primary-600" />
                  <span>Headquarters & Innovation Hub</span>
                </div>
                <p className="pl-6 text-[11px] leading-relaxed">
                  Tech Cluster 4, Outer Ring Road, Bengaluru, Karnataka, India
                </p>
              </div>
            </div>

            {/* Main Form Card */}
            <Card variant="bento" className="p-8 sm:p-10">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-700 block">
                Interactive Form Preview
              </span>
              <h2 className="mt-2 text-xl font-bold text-slate-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Fill in the form details below to test our client-side validation and feedback engine.
              </p>
              <ContactForm />
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
