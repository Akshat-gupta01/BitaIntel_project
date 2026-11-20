'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Send, Lock } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { toast } from 'sonner';
import type { Business } from '@/data';

export function EnquiryModal({ business }: { business: Business }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name Required', { description: 'Please enter your full name.' });
      return;
    }
    if (!email.includes('@')) {
      toast.error('Invalid Email', { description: 'Please provide a valid corporate email.' });
      return;
    }
    if (!message.trim()) {
      toast.error('Message Required', { description: 'Please describe your procurement or partnership intent.' });
      return;
    }
    setSent(true);
    toast.success('Enquiry Dispatched', {
      description: `Your verified enquiry has been sent to ${business.name}.`,
    });
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setSent(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 300);
  }

  return (
    <>
      <Button
        variant="primary"
        className="w-full justify-center shadow-md"
        size="lg"
        onClick={() => setOpen(true)}
        icon={<Mail className="size-4" />}
      >
        Initiate Verified Enquiry
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        title={`Enquire with ${business.name}`}
        description={`Direct verified procurement channel for ${business.legalName}`}
      >
        {sent ? (
          <div className="rounded-2xl border border-primary-500/30 bg-primary-50 p-6 text-center space-y-3">
            <div className="mx-auto size-12 rounded-full bg-primary-100 text-primary-600 grid place-items-center">
              <CheckCircle2 className="size-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Enquiry Preview Submitted
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              In this frontend demo, your enquiry has been validated locally. In the production deployment, an encrypted message with mutual NDA consent tokens would be delivered to {business.name}&apos;s verified representative.
            </p>
            <Button variant="secondary" onClick={handleClose} className="mt-4">
              Close Preview
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Target Entity:</span>
                <span>{business.name}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GSTIN:</span>
                <span>{business.gstin}</span>
              </div>
            </div>

            <Input
              label="Your Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
            />

            <Input
              label="Corporate Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@corporate-domain.com"
            />

            <Textarea
              label="Procurement / Partnership Intent"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Outline the product scope, approximate monthly volume, and timeline..."
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="dark"
                className="w-full justify-center"
                rightIcon={<Send className="size-4" />}
              >
                Send Verified Enquiry
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 text-center">
              <Lock className="size-3 text-slate-400" />
              Protected under BITAINTEL Reciprocal Confidentiality Protocol.
            </p>
          </form>
        )}
      </Dialog>
    </>
  );
}
