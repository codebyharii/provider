"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      city: formData.get('city') as string,
      description: formData.get('description') as string,
      serviceId: parseInt(formData.get('serviceId') as string, 10),
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit lead');
      
      setSuccess('Lead submitted successfully! Your request has been assigned to our partners.');
      e.currentTarget.reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Request Service</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-dark block mb-1">Name</label>
            <Input name="name" required placeholder="John Doe" />
          </div>
          <div>
            <label className="text-sm font-medium text-dark block mb-1">Phone</label>
            <Input name="phone" required placeholder="+1234567890" />
          </div>
          <div>
            <label className="text-sm font-medium text-dark block mb-1">City</label>
            <Input name="city" required placeholder="New York" />
          </div>
          <div>
            <label className="text-sm font-medium text-dark block mb-1">Service Required</label>
            <Select 
              name="serviceId" 
              required 
              defaultValue=""
              options={[
                { value: 1, label: 'Service 1' },
                { value: 2, label: 'Service 2' },
                { value: 3, label: 'Service 3' },
              ]}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark block mb-1">Description</label>
            <textarea 
              name="description" 
              required 
              className="flex w-full rounded-md border border-muted bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light placeholder:text-muted" 
              rows={4}
              placeholder="Tell us about your requirements..."
            />
          </div>

          {error && <p className="text-danger text-sm font-medium">{error}</p>}
          {success && <p className="text-success text-sm font-medium">{success}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
