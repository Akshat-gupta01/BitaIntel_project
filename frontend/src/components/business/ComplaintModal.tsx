'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { toast } from 'sonner';
import type { Business } from '@/data';
import {
  submitComplaint,
  type ComplaintCategory,
  type ComplaintSeverity,
} from '@services/complaint.service';

interface ComplaintModalProps {
  business: Business;
  triggerButton?: React.ReactNode;
}

const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'QUALITY_ISSUE', label: 'Product / Quality Defect' },
  { value: 'DELIVERY_DEFAULT', label: 'Delivery / SLA Default' },
  { value: 'MISREPRESENTATION', label: 'Profile / Credential Misrepresentation' },
  { value: 'STATUTORY_NON_COMPLIANCE', label: 'Statutory / Regulatory Non-Compliance' },
  { value: 'FRAUD', label: 'Suspected Fraud / Commercial Dispute' },
  { value: 'OTHER', label: 'Other Compliance Concern' },
];

const SEVERITIES: { value: ComplaintSeverity; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export function ComplaintModal({ business, triggerButton }: ComplaintModalProps) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaintRef, setComplaintRef] = useState<string | null>(null);
  const [category, setCategory] = useState<ComplaintCategory>('QUALITY_ISSUE');
  const [severity, setSeverity] = useState<ComplaintSeverity>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (subject.trim().length < 5) {
      toast.error('Subject Required', { description: 'Please enter at least 5 characters for the subject.' });
      return;
    }
    if (description.trim().length < 10) {
      toast.error('Details Required', { description: 'Please provide at least 10 characters describing the issue.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitComplaint({
        businessSlug: (business as { slug?: string }).slug || business.id,
        businessId: business.id,
        category,
        severity,
        subject: subject.trim(),
        description: description.trim(),
      });
      setComplaintRef(res?.complaint?.complaintNumber || null);
      setSent(true);
      toast.success('Compliance Complaint Filed', {
        description: res?.complaint?.complaintNumber
          ? `Reference ${res.complaint.complaintNumber} routed to BITAINTEL Compliance Desk.`
          : 'Your complaint has been logged for auditor review.',
      });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
      const msg =
        apiErr?.response?.data?.error?.message ||
        apiErr?.response?.data?.message ||
        'Could not submit complaint. Please try again.';
      toast.error('Submission Failed', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setSent(false);
      setComplaintRef(null);
      setSubject('');
      setDescription('');
      setCategory('QUALITY_ISSUE');
      setSeverity('MEDIUM');
    }, 250);
  }

  return (
    <>
      {triggerButton ? (
        <span onClick={() => setOpen(true)} className="inline-block cursor-pointer w-full">
          {triggerButton}
        </span>
      ) : (
        <Button
          variant="outline"
          className="w-full justify-center text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
          onClick={() => setOpen(true)}
          icon={<AlertTriangle className="size-3.5" />}
        >
          Report / File Complaint
        </Button>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        title={`File Compliance Complaint — ${business.name}`}
        description="Complaints are audited by BITAINTEL Super Admin & Compliance Officers and affect vendor governance risk signals."
        size="md"
      >
        {sent ? (
          <div className="py-6 text-center space-y-4">
            <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center mx-auto">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-slate-900">Complaint Registered</h4>
              {complaintRef && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono font-bold">
                  Reference ID: {complaintRef}
                </div>
              )}
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Our compliance team will review this report against <strong className="text-slate-700">{business.name}</strong> and update the governance status accordingly.
              </p>
            </div>
            <Button onClick={handleClose} variant="secondary" size="sm">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Complaint Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as ComplaintSeverity)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {SEVERITIES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Subject *"
              placeholder="e.g., Batch quality mismatch or delayed statutory dispatch"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <Textarea
              label="Detailed Description *"
              placeholder="Describe order/PO reference, dates, discrepancy, or compliance concern..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5 text-[11px] text-amber-800">
              <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                False or malicious complaints are logged against your verified account. Genuine reports are audited confidentially by BITAINTEL Compliance Officers.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" /> Submitting...
                  </>
                ) : (
                  'Submit Complaint'
                )}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
