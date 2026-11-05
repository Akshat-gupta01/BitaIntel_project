'use client';

import { useState } from 'react';
import { CheckCircle2, Send, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from 'sonner';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || !message.trim()) {
      const err = 'Please provide your name, valid corporate email, and enquiry details.';
      setError(err);
      toast.error('Validation Error', { description: err });
      return;
    }
    setError('');
    setSubmitted(true);
    toast.success('Query Submitted Successfully', {
      description: `Thank you, ${name}. Our regulatory team will respond to ${email}.`,
    });
  }

  function handleReset() {
    setSubmitted(false);
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
          Message Preview Validated
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Thank you, <strong className="text-slate-900">{name}</strong>. In this frontend demonstration, your message and credentials have been verified locally. In production, a BITAINTEL regulatory representative would contact your domain at <strong className="text-slate-900">{email}</strong> within 1 business day.
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
          className="w-full justify-center"
          rightIcon={<Send className="size-4" />}
        >
          Send Message Preview
        </Button>
      </div>

      <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
        <Lock className="size-3 text-slate-400" />
        Frontend demonstration only. Form contents are processed locally in your browser.
      </p>
    </form>
  );
}
