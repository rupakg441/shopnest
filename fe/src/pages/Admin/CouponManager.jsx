import React, { useState } from 'react';
import { useCreateCouponMutation, useDisableCouponMutation, useGetAdminCouponsQuery, useUpdateCouponMutation } from '../../features/checkout/couponApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const emptyCoupon = () => ({ code: '', type: 'percentage', value: '', minOrderAmount: '0', maxDiscount: '', startsAt: new Date().toISOString().slice(0, 10), expiresAt: '', usageLimit: '0', isActive: true });

export default function CouponManager() {
  const { data: coupons = [], isLoading } = useGetAdminCouponsQuery();
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: updating }] = useUpdateCouponMutation();
  const [disableCoupon] = useDisableCouponMutation();
  const [form, setForm] = useState(emptyCoupon());
  const [editingId, setEditingId] = useState('');

  const edit = (coupon) => {
    setEditingId(coupon._id);
    setForm({ code: coupon.code, type: coupon.type, value: String(coupon.value), minOrderAmount: String(coupon.minOrderAmount || 0), maxDiscount: coupon.maxDiscount == null ? '' : String(coupon.maxDiscount), startsAt: new Date(coupon.startsAt).toISOString().slice(0, 10), expiresAt: new Date(coupon.expiresAt).toISOString().slice(0, 10), usageLimit: String(coupon.usageLimit || 0), isActive: coupon.isActive });
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, code: form.code.trim().toUpperCase(), value: Number(form.value), minOrderAmount: Number(form.minOrderAmount), maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount), usageLimit: Number(form.usageLimit), startsAt: new Date(`${form.startsAt}T00:00:00`), expiresAt: new Date(`${form.expiresAt}T23:59:59`) };
    try {
      if (editingId) await updateCoupon({ id: editingId, ...payload }).unwrap();
      else await createCoupon(payload).unwrap();
      setEditingId(''); setForm(emptyCoupon());
    } catch (error) { window.alert(error.data?.message || 'Could not save coupon.'); }
  };

  if (isLoading) return <LoadingSpinner />;
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  return <section className="space-y-md">
    <header><h1 className="font-headline-sm text-primary">Coupon management</h1><p className="text-sm text-on-surface-variant">Create fixed or percentage discounts with minimums, expiry, and usage limits.</p></header>
    <form onSubmit={submit} className="grid gap-3 rounded-xl border bg-white p-md sm:grid-cols-2 lg:grid-cols-4">
      <input required pattern="[A-Za-z0-9_-]{3,40}" maxLength="40" value={form.code} onChange={set('code')} placeholder="Coupon code" className="rounded-lg border p-2 uppercase" />
      <select value={form.type} onChange={set('type')} className="rounded-lg border"><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select>
      <input required type="number" min="0.01" step="0.01" max={form.type === 'percentage' ? '100' : undefined} value={form.value} onChange={set('value')} placeholder={form.type === 'percentage' ? 'Discount %' : 'Discount amount'} className="rounded-lg border p-2" />
      <input type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={set('minOrderAmount')} placeholder="Minimum order" className="rounded-lg border p-2" />
      <input type="number" min="0.01" step="0.01" value={form.maxDiscount} onChange={set('maxDiscount')} placeholder="Max discount (optional)" className="rounded-lg border p-2" />
      <label className="text-xs">Starts<input required type="date" value={form.startsAt} onChange={set('startsAt')} className="mt-1 block w-full rounded-lg border p-2" /></label>
      <label className="text-xs">Expires<input required type="date" value={form.expiresAt} onChange={set('expiresAt')} className="mt-1 block w-full rounded-lg border p-2" /></label>
      <input required type="number" min="0" step="1" value={form.usageLimit} onChange={set('usageLimit')} placeholder="Usage limit (0 = unlimited)" className="rounded-lg border p-2" />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Active</label>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-3"><button disabled={creating || updating} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">{editingId ? 'Save changes' : 'Create coupon'}</button>{editingId && <button type="button" onClick={() => { setEditingId(''); setForm(emptyCoupon()); }} className="rounded-lg border px-4">Cancel</button>}</div>
    </form>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-surface-container-low"><tr>{['Code','Discount','Minimum','Usage','Expires','Status',''].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{coupons.map((coupon) => <tr key={coupon._id} className="border-t"><td className="p-3 font-bold">{coupon.code}</td><td className="p-3">{coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}{coupon.maxDiscount != null && <span className="block text-xs text-on-surface-variant">Max ${coupon.maxDiscount.toFixed(2)}</span>}</td><td className="p-3">${coupon.minOrderAmount.toFixed(2)}</td><td className="p-3">{coupon.usageCount} / {coupon.usageLimit || '∞'}</td><td className="p-3">{new Date(coupon.expiresAt).toLocaleDateString()}</td><td className="p-3">{coupon.isActive ? 'Active' : 'Disabled'}</td><td className="p-3 text-right"><button onClick={() => edit(coupon)} className="mr-3 underline">Edit</button>{coupon.isActive && <button onClick={() => disableCoupon(coupon._id)} className="text-error underline">Disable</button>}</td></tr>)}{!coupons.length && <tr><td colSpan="7" className="p-8 text-center text-on-surface-variant">No coupons created.</td></tr>}</tbody></table></div>
  </section>;
}
