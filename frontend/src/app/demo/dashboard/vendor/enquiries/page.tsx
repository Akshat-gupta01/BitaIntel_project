import { redirect } from 'next/navigation';

export default function VendorEnquiriesRedirect() {
  redirect('/demo/dashboard/vendor?tab=enquiries');
}
