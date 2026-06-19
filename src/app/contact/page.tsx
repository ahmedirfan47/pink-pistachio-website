import type { Metadata } from 'next';
import ContactForm from './ContactForm';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { BRANCHES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Pink Pistachio — questions, feedback, custom cake orders and catering enquiries welcome.',
};

export default function ContactPage() {
  return (
    <div className="container-px mx-auto max-w-6xl py-12">
      <div className="mb-10 text-center">
        <span className="section-eyebrow">Get in Touch</span>
        <h1 className="section-heading">We&apos;d Love to Hear From You</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-charcoal-600 sm:text-base">
          Questions, feedback, custom cake orders or catering enquiries — drop us a
          message and our team will reply within 24 hours.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <ContactForm />

        <div className="space-y-6">
          {BRANCHES.map((b) => (
            <div key={b.id} className="card p-6">
              <h3 className="font-display text-lg font-bold text-charcoal">{b.name}</h3>
              <div className="mt-3 space-y-2 text-sm text-charcoal-600">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />
                  {b.address}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-pink-500" />
                  Open {b.hours}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-pink-500" />
                  {b.phone}
                </p>
              </div>
              <a
                href={b.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-4 inline-flex"
              >
                Get Directions
              </a>
            </div>
          ))}

          <div className="card flex items-center gap-3 p-6">
            <Mail className="h-5 w-5 shrink-0 text-pink-500" />
            <div>
              <p className="text-sm font-semibold text-charcoal">Email Us</p>
              <p className="text-sm text-charcoal-600">hello@pinkpistachio.pk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}