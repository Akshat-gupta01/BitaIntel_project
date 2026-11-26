'use client';

import { useState } from 'react';
import { CheckCircle2, Send, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { submitContactQuery } from '@services/vendor.service';
import { toast } from 'sonner';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || !message.trim()) {
      const err = 'Please provide your name, valid corporate email, and enquiry details.';
      setError(err);
      toast.error('Validation Error', { description: err });
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const res = await submitContactQuery({
        name: name.trim(),
        email: email.trim(),
        company: company.trim() || undefined,
        category,
        message: message.trim(),
      });
      setTicketId(res?.ticketId || '');
      setSubmitted(true);
      toast.success('Query Submitted Successfully', {
        description: res?.ticketId
          ? `Ticket ${res.ticketId} created. Our team will respond to ${email}.`
          : `Thank you, ${name}. Our regulatory team will respond to ${email}.`,
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message || 'Unable to submit inquiry right now. Please try again.';
      setError(msg);
      toast.error('Submission Failed', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setSubmitted(false);
    setTicketId('');
    setName('');
    setEmail('');
    setCompany('');
    setMessage('');
    setError('');
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-3xl border border-primary-500/30 bg-primary-50/90 p-8 text-center space-y-4 backdrop-blur-xl animate-in zoom-in-95"
      >
        <div className="mx-auto size-14 rounded-full bg-primary-100 text-primary-600 grid place-items-center">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          Inquiry Registered
        </h3>
        {ticketId && (
          <div className="inline-block rounded-full bg-white border border-primary-200 px-3.5 py-1 text-xs font-mono font-bold text-primary-800">
            Ticket ID: {ticketId}
          </div>
        )}
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Thank you, <strong className="text-slate-900">{name}</strong>. Your inquiry has been logged with the BITAINTEL Trust &amp; Compliance Desk. A specialist will respond to <strong className="text-slate-900">{email}</strong> within 1 business day.
        </p>
        <div className="pt-2">
          <Button variant="secondary" onClick={handleReset}>
            Submit Another Query
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Your Full Name"
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Vikram Malhotra"
        />
        <Input
          label="Corporate Email Address"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Company Name (Optional)"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Apex Industrial Solutions"
        />
        <Select
          label="Enquiry Category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="General Enquiry">General Platform Enquiry</option>
          <option value="Vendor Verification">Vendor Verification & Onboarding</option>
          <option value="Procurement Integration">Procurement / ERP API Access</option>
          <option value="Profile Correction">Profile Audit & Re-Verification</option>
        </Select>
      </div>

      <Textarea
        label="How can our trust team help?"
        name="message"
        required
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Detail your requirements, business sector, or compliance verification questions..."
      />

      {error && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          variant="dark"
          size="lg"
          disabled={isSubmitting}
          className="w-full justify-center"
          rightIcon={<Send className="size-4" />}
        >
          {isSubmitting ? 'Submitting Query...' : 'Submit Inquiry'}
        </Button>
      </div>

      <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
        <Lock className="size-3 text-slate-400" />
        Encrypted submission logged with a tracked BITAINTEL support ticket ID.
      </p>
    </form>
  );
}
