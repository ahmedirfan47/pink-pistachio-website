'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '@/lib/validations';
import { z } from 'zod';
import { Send, CheckCircle2 } from 'lucide-react';

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    setServerError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send message');
      }
      setSubmitted(true);
      reset();
    } catch (err: any) {
      setServerError(
        err.message || 'Something went wrong. Please try again or call us directly.'
      );
    }
  };

  if (submitted) {
    return (
      <div className="card flex flex-col items-center p-8 py-12 text-center">
        <CheckCircle2 className="h-14 w-14 text-pistachio-500" />
        <h2 className="mt-4 font-display text-xl font-bold text-charcoal">
          Message Sent!
        </h2>
        <p className="mt-2 text-sm text-charcoal-600">
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="btn-secondary mt-6"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6 sm:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Full Name</label>
            <input
              {...register('name')}
              className="input-field"
              placeholder="Your name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="label-field">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className="input-field"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Phone (optional)</label>
            <input
              {...register('phone')}
              className="input-field"
              placeholder="03XX XXXXXXX"
            />
          </div>
          <div>
            <label className="label-field">Subject</label>
            <input
              {...register('subject')}
              className="input-field"
              placeholder="e.g. Custom cake order"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Message</label>
          <textarea
            {...register('message')}
            rows={5}
            className="input-field"
            placeholder="How can we help?"
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
          )}
        </div>

        {serverError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}