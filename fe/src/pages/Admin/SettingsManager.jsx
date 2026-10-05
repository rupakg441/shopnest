import { useEffect, useState } from 'react';
import { Save, Settings } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from '../../features/dashboard/settingsApi';

const emptyForm = {
  storeName: 'ShopNest',
  supportEmail: '',
  supportPhone: '',
  announcement: '',
  announcementEnabled: false,
};

const SettingsManager = () => {
  const { data, isLoading, error } = useGetStoreSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateStoreSettingsMutation();
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (data) setForm({
      storeName: data.storeName || emptyForm.storeName,
      supportEmail: data.supportEmail || '',
      supportPhone: data.supportPhone || '',
      announcement: data.announcement || '',
      announcementEnabled: Boolean(data.announcementEnabled),
    });
  }, [data]);

  const setField = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setNotice('');
  };

  const save = async (event) => {
    event.preventDefault();
    setNotice('');
    try {
      await updateSettings(form).unwrap();
      setNotice('Store settings saved.');
    } catch (saveError) {
      setNotice(saveError?.data?.errors?.[0] || saveError?.data?.message || 'Could not save store settings.');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <section className="mx-auto max-w-3xl space-y-lg">
      <header>
        <div className="flex items-center gap-2 text-primary"><Settings size={22} /><h1 className="text-2xl font-bold">Store settings</h1></div>
        <p className="mt-2 text-sm text-on-surface-variant">Manage the store identity, customer support contacts, and storefront announcement.</p>
      </header>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">Could not load store settings. Refresh to try again.</p>}
      <form onSubmit={save} className="space-y-md rounded-xl border border-outline-variant/30 bg-white p-lg shadow-xs">
        <label className="block space-y-1 text-sm font-medium">Store name<input name="storeName" required minLength={2} maxLength={80} value={form.storeName} onChange={setField} className="w-full rounded-lg border p-3" /></label>
        <div className="grid gap-md sm:grid-cols-2">
          <label className="block space-y-1 text-sm font-medium">Support email<input type="email" name="supportEmail" maxLength={254} value={form.supportEmail} onChange={setField} className="w-full rounded-lg border p-3" /></label>
          <label className="block space-y-1 text-sm font-medium">Support phone<input type="tel" name="supportPhone" maxLength={40} value={form.supportPhone} onChange={setField} className="w-full rounded-lg border p-3" /></label>
        </div>
        <label className="block space-y-1 text-sm font-medium">Storefront announcement<textarea name="announcement" maxLength={240} rows={3} value={form.announcement} onChange={setField} className="w-full rounded-lg border p-3" /><span className="text-xs font-normal text-on-surface-variant">Up to 240 characters.</span></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="announcementEnabled" checked={Boolean(form.announcementEnabled)} onChange={setField} />Show announcement on the storefront</label>
        {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
        <button type="submit" disabled={saving || Boolean(error)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50"><Save size={16} />{saving ? 'Saving…' : 'Save settings'}</button>
      </form>
    </section>
  );
};

export default SettingsManager;
