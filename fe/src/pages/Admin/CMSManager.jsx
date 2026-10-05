import React, { useState } from 'react';
import { useCreateBannerMutation, useCreatePageMutation, useDisableBannerMutation, useGetAdminBannersQuery, useGetAdminPagesQuery, useUnpublishPageMutation, useUpdateBannerMutation, useUpdatePageMutation } from '../../features/dashboard/cmsApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const freshBanner = () => ({ title: '', subtitle: '', imageUrl: '', ctaLabel: '', ctaUrl: '', placement: 'home_hero', sortOrder: 0, startsAt: '', endsAt: '', isActive: true });
const freshPage = () => ({ slug: '', title: '', content: '', isPublished: false });

export default function CMSManager() {
  const [section, setSection] = useState('banners');
  const { data: banners = [], isLoading: bannersLoading } = useGetAdminBannersQuery();
  const { data: pages = [], isLoading: pagesLoading } = useGetAdminPagesQuery();
  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [disableBanner] = useDisableBannerMutation();
  const [createPage] = useCreatePageMutation();
  const [updatePage] = useUpdatePageMutation();
  const [unpublishPage] = useUnpublishPageMutation();
  const [bannerForm, setBannerForm] = useState(freshBanner());
  const [pageForm, setPageForm] = useState(freshPage());
  const [bannerId, setBannerId] = useState('');
  const [pageId, setPageId] = useState('');

  const saveBanner = async (event) => {
    event.preventDefault();
    const body = { ...bannerForm, sortOrder: Number(bannerForm.sortOrder), startsAt: bannerForm.startsAt ? new Date(bannerForm.startsAt) : null, endsAt: bannerForm.endsAt ? new Date(bannerForm.endsAt) : null };
    try {
      if (bannerId) await updateBanner({ id: bannerId, ...body }).unwrap(); else await createBanner(body).unwrap();
      setBannerId(''); setBannerForm(freshBanner());
    } catch (error) { window.alert(error.data?.message || 'Could not save banner.'); }
  };
  const savePage = async (event) => {
    event.preventDefault();
    try {
      if (pageId) await updatePage({ id: pageId, ...pageForm }).unwrap(); else await createPage(pageForm).unwrap();
      setPageId(''); setPageForm(freshPage());
    } catch (error) { window.alert(error.data?.message || 'Could not save page.'); }
  };
  const field = (setForm, key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  if (bannersLoading || pagesLoading) return <LoadingSpinner />;
  return <section className="space-y-md">
    <header><h1 className="font-headline-sm text-primary">Content management</h1><p className="text-sm text-on-surface-variant">Manage storefront banners and published information pages.</p></header>
    <nav className="flex gap-2"><button onClick={() => setSection('banners')} className={`rounded-lg px-4 py-2 ${section === 'banners' ? 'bg-primary text-white' : 'border'}`}>Banners</button><button onClick={() => setSection('pages')} className={`rounded-lg px-4 py-2 ${section === 'pages' ? 'bg-primary text-white' : 'border'}`}>Pages</button></nav>
    {section === 'banners' ? <div className="space-y-md">
      <form onSubmit={saveBanner} className="grid gap-3 rounded-xl border bg-white p-md sm:grid-cols-2">
        <input required value={bannerForm.title} onChange={field(setBannerForm, 'title')} placeholder="Banner title" className="rounded-lg border p-2" />
        <input required type="url" value={bannerForm.imageUrl} onChange={field(setBannerForm, 'imageUrl')} placeholder="HTTPS image URL" className="rounded-lg border p-2" />
        <textarea value={bannerForm.subtitle} onChange={field(setBannerForm, 'subtitle')} placeholder="Subtitle" className="rounded-lg border p-2 sm:col-span-2" />
        <input value={bannerForm.ctaLabel} onChange={field(setBannerForm, 'ctaLabel')} placeholder="Button label" className="rounded-lg border p-2" />
        <input value={bannerForm.ctaUrl} onChange={field(setBannerForm, 'ctaUrl')} placeholder="Button path or HTTPS URL" className="rounded-lg border p-2" />
        <select value={bannerForm.placement} onChange={field(setBannerForm, 'placement')} className="rounded-lg border p-2"><option value="home_hero">Home hero</option><option value="promo">Promotion</option></select>
        <input type="number" min="0" value={bannerForm.sortOrder} onChange={field(setBannerForm, 'sortOrder')} placeholder="Sort order" className="rounded-lg border p-2" />
        <label className="text-xs">Starts at (optional)<input type="datetime-local" value={bannerForm.startsAt} onChange={field(setBannerForm, 'startsAt')} className="mt-1 block w-full rounded-lg border p-2" /></label>
        <label className="text-xs">Ends at (optional)<input type="datetime-local" value={bannerForm.endsAt} onChange={field(setBannerForm, 'endsAt')} className="mt-1 block w-full rounded-lg border p-2" /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={bannerForm.isActive} onChange={field(setBannerForm, 'isActive')} /> Active</label>
        <div className="flex gap-2"><button className="rounded-lg bg-primary px-4 py-2 text-sm text-white">{bannerId ? 'Save banner' : 'Create banner'}</button>{bannerId && <button type="button" onClick={() => { setBannerId(''); setBannerForm(freshBanner()); }} className="rounded-lg border px-4">Cancel</button>}</div>
      </form>
      <div className="space-y-3">{banners.map((banner) => <article key={banner._id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3"><img src={banner.imageUrl} alt="" className="h-16 w-24 rounded object-cover" /><div className="min-w-0 flex-1"><strong>{banner.title}</strong><p className="text-xs text-on-surface-variant">{banner.placement} · order {banner.sortOrder} · {banner.isActive ? 'Active' : 'Disabled'}</p></div><button onClick={() => { setBannerId(banner._id); setBannerForm({ ...banner, startsAt: banner.startsAt ? new Date(banner.startsAt).toISOString().slice(0,16) : '', endsAt: banner.endsAt ? new Date(banner.endsAt).toISOString().slice(0,16) : '' }); }} className="underline">Edit</button>{banner.isActive && <button onClick={() => disableBanner(banner._id)} className="text-error underline">Disable</button>}</article>)}</div>
    </div> : <div className="space-y-md">
      <form onSubmit={savePage} className="space-y-3 rounded-xl border bg-white p-md">
        <div className="grid gap-3 sm:grid-cols-2"><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={pageForm.slug} onChange={field(setPageForm, 'slug')} placeholder="Slug (e.g. privacy-policy)" className="rounded-lg border p-2" /><input required value={pageForm.title} onChange={field(setPageForm, 'title')} placeholder="Page title" className="rounded-lg border p-2" /></div>
        <textarea required rows="10" value={pageForm.content} onChange={field(setPageForm, 'content')} placeholder="Page content (plain text)" className="w-full rounded-lg border p-3" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pageForm.isPublished} onChange={field(setPageForm, 'isPublished')} /> Published</label>
        <div className="flex gap-2"><button className="rounded-lg bg-primary px-4 py-2 text-sm text-white">{pageId ? 'Save page' : 'Create page'}</button>{pageId && <button type="button" onClick={() => { setPageId(''); setPageForm(freshPage()); }} className="rounded-lg border px-4">Cancel</button>}</div>
      </form>
      <div className="space-y-3">{pages.map((page) => <article key={page._id} className="flex items-center gap-3 rounded-xl border bg-white p-3"><div className="flex-1"><strong>{page.title}</strong><p className="text-xs text-on-surface-variant">/pages/{page.slug} · {page.isPublished ? 'Published' : 'Draft'}</p></div><button onClick={() => { setPageId(page._id); setPageForm({ slug: page.slug, title: page.title, content: page.content, isPublished: page.isPublished }); }} className="underline">Edit</button>{page.isPublished && <button onClick={() => unpublishPage(page._id)} className="text-error underline">Unpublish</button>}</article>)}</div>
    </div>}
  </section>;
}
