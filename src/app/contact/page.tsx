'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '@/lib/validations';
import { z } from 'zod';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { BRANCHES } from '@/lib/constants';

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactForm) => {
    setServerError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError('Something went wrong. Please try again or call us directly.');
    }
  };

  return (
    <div className="container-px mx-auto max-w-6xl py-12">
      <div className="mb-10 text-center">
        <span className="section-eyebrow">Get in Touch</span>
        <h1 className="section-heading">We&apos;d Love to Hear From You</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-charcoal-600 sm:text-base">
          Questions, feedback, custom cake orders or catering enquiries — drop us a message and our team
          will reply within 24 hours.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="card p-6 sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle2 className="h-14 w-14 text-pistachio-500" />
              <h2 className="mt-4 font-display text-xl font-bold text-charcoal">Message Sent!</h2>
              <p className="mt-2 text-sm text-charcoal-600">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary mt-6">Send Another Message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Full Name</label>
                  <input {...register('name')} className="input-field" placeholder="Your name" />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label-field">Email Address</label>
                  <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Phone (optional)</label>
                  <input {...register('phone')} className="input-field" placeholder="03XX XXXXXXX" />
                </div>
                <div>
                  <label className="label-field">Subject</label>
                  <input {...register('subject')} className="input-field" placeholder="e.g. Custom cake order" />
                </div>
              </div>
              <div>
                <label className="label-field">Message</label>
                <textarea {...register('message')} rows={5} className="input-field" placeholder="How can we help?" />
                {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
              </div>
              {serverError && <p className="text-sm text-red-600">{serverError}</p>}
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                <Send className="h-4 w-4" /> {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        <div className="space-y-6">
          {BRANCHES.map((b) => (
            <div key={b.id} className="card p-6">
              <h3 className="font-display text-lg font-bold text-charcoal">{b.name}</h3>
              <div className="mt-3 space-y-2 text-sm text-charcoal-600">
                <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" />{b.address}</p>
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-pink-500" />Open {b.hours}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-pink-500" />{b.phone}</p>
              </div>
              <a href={b.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-4 inline-flex">Get Directions</a>
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