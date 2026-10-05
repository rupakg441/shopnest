import { useState } from 'react';
import { Edit3, ImagePlus, Plus, Power, X } from 'lucide-react';
import {
  useCreateCategoryMutation,
  useDisableCategoryMutation,
  useGetAdminCategoriesQuery,
  useUpdateCategoryMutation,
  useUploadCategoryImageMutation,
} from '../../features/categories/categoryApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const emptyForm = { name: '', description: '', image: '', imagePublicId: '', parent: '', sortOrder: 0, isActive: true };

export default function CategoryManager() {
  const { data: categories = [], isLoading, error } = useGetAdminCategoriesQuery();
  const [createCategory, createState] = useCreateCategoryMutation();
  const [updateCategory, updateState] = useUpdateCategoryMutation();
  const [disableCategory, disableState] = useDisableCategoryMutation();
  const [uploadCategoryImage, uploadState] = useUploadCategoryImageMutation();
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
    setForm(emptyForm);
    setImageFile(null);
    setMessage('');
  };

  const openEdit = (category) => {
    setEditing(category);
    setIsModalOpen(true);
    setForm({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      imagePublicId: category.imagePublicId || '',
      parent: category.parent?._id || '',
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive !== false,
    });
    setImageFile(null);
    setMessage('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      let image = form.image;
      let imagePublicId = form.imagePublicId;
      if (imageFile) {
        const data = new FormData();
        data.append('image', imageFile);
        const uploaded = await uploadCategoryImage(data).unwrap();
        image = uploaded.url;
        imagePublicId = uploaded.publicId;
      }
      const payload = {
        ...form,
        image,
        imagePublicId,
        parent: form.parent || null,
        sortOrder: Number(form.sortOrder),
      };
      if (editing) await updateCategory({ id: editing._id, ...payload }).unwrap();
      else await createCategory(payload).unwrap();
      setEditing(null);
      setIsModalOpen(false);
      setForm(emptyForm);
      setImageFile(null);
    } catch (err) {
      setMessage(err?.data?.message || 'Could not save this category. Check the fields and try again.');
    }
  };

  const toggleStatus = async (category) => {
    setMessage('');
    try {
      if (category.isActive === false) await updateCategory({ id: category._id, isActive: true }).unwrap();
      else await disableCategory(category._id).unwrap();
    } catch (err) {
      setMessage(err?.data?.message || 'Could not update category status.');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const saving = createState.isLoading || updateState.isLoading || uploadState.isLoading;

  return (
    <section className="space-y-lg">
      <header className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant">Catalog setup</p>
          <h1 className="font-headline-md text-headline-md">Categories</h1>
          <p className="mt-xs text-sm text-on-surface-variant">Build a browsable hierarchy and control which categories appear in the storefront.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-sm rounded-xl bg-primary px-md py-sm text-white"><Plus size={16} /> Add category</button>
      </header>

      {(message || error) && <p role="alert" className="rounded-lg bg-error-container p-md text-sm text-on-error-container">{message || error?.data?.message || 'Categories could not be loaded.'}</p>}

      <div className="overflow-x-auto rounded-2xl border border-outline-variant/40 bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-container-low text-xs uppercase text-on-surface-variant"><tr><th className="p-md">Category</th><th className="p-md">Parent</th><th className="p-md">Products</th><th className="p-md">Status</th><th className="p-md">Actions</th></tr></thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id} className="border-t border-outline-variant/30">
                <td className="p-md"><div className="flex items-center gap-sm">{category.image ? <img src={category.image} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-container"><ImagePlus size={18} /></span>}<div><p className="font-semibold">{category.name}</p><p className="text-xs text-on-surface-variant">/{category.slug}</p></div></div></td>
                <td className="p-md">{category.parent?.name || '—'}</td>
                <td className="p-md">{category.count || 0}</td>
                <td className="p-md"><span className={`rounded-full px-sm py-xs text-xs ${category.isActive === false ? 'bg-surface-container text-on-surface-variant' : 'bg-green-100 text-green-800'}`}>{category.isActive === false ? 'Disabled' : 'Active'}</span></td>
                <td className="p-md"><div className="flex gap-xs"><button title="Edit category" onClick={() => openEdit(category)} className="rounded-lg border p-sm"><Edit3 size={16} /></button><button title={category.isActive === false ? 'Enable category' : 'Disable category'} disabled={disableState.isLoading || updateState.isLoading} onClick={() => toggleStatus(category)} className="rounded-lg border p-sm"><Power size={16} /></button></div></td>
              </tr>
            ))}
            {!categories.length && <tr><td colSpan="5" className="p-xl text-center text-on-surface-variant">No categories yet. Add one to begin.</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-md" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="category-dialog-title" className="w-full max-w-xl rounded-2xl bg-surface p-lg shadow-xl">
            <header className="mb-md flex items-center justify-between"><h2 id="category-dialog-title" className="font-headline-sm text-headline-sm">{editing ? 'Edit category' : 'Add category'}</h2><button onClick={() => { setIsModalOpen(false); setEditing(null); setForm(emptyForm); }} aria-label="Close"><X /></button></header>
            <form onSubmit={submit} className="space-y-md">
              <label className="block text-sm">Name<input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-xs w-full rounded-lg border-outline-variant" /></label>
              <label className="block text-sm">Description<textarea maxLength={2000} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-xs w-full rounded-lg border-outline-variant" /></label>
              <div className="grid grid-cols-2 gap-md">
                <label className="block text-sm">Parent category<select value={form.parent} onChange={(event) => setForm({ ...form, parent: event.target.value })} className="mt-xs w-full rounded-lg border-outline-variant"><option value="">No parent</option>{categories.filter((item) => item._id !== editing?._id && item.isActive !== false).map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
                <label className="block text-sm">Display order<input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} className="mt-xs w-full rounded-lg border-outline-variant" /></label>
              </div>
              <label className="block text-sm">Category image<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setImageFile(event.target.files?.[0] || null)} className="mt-xs block w-full text-sm" /></label>
              {form.image && <img src={form.image} alt="Current category" className="h-24 w-24 rounded-xl object-cover" />}
              <label className="flex items-center gap-sm text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />Visible in storefront</label>
              <button disabled={saving} className="w-full rounded-xl bg-primary px-md py-sm text-white">{saving ? 'Saving…' : editing ? 'Save changes' : 'Create category'}</button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
