import React, { useState } from 'react';
import { useAdjustStockMutation, useGetInventoryQuery, useGetStockHistoryQuery } from '../../features/inventory/inventoryApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function ProductInventoryRow({ product }) {
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [variantSku, setVariantSku] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const { data: history = [] } = useGetStockHistoryQuery(product._id, { skip: !showHistory });
  const [adjust, { isLoading }] = useAdjustStockMutation();
  const currentVariant = product.variants?.find((variant) => variant.sku === variantSku);
  const currentStock = currentVariant?.stock ?? product.stock;
  const submit = async (event) => {
    event.preventDefault();
    try {
      await adjust({ id: product._id, delta: Number(delta), reason, ...(variantSku ? { variantSku } : {}) }).unwrap();
      setDelta(''); setReason('');
    } catch (error) { window.alert(error.data?.message || 'Stock adjustment failed.'); }
  };
  return <tr className="border-b align-top">
    <td className="p-3"><div className="flex items-center gap-3">{product.image && <img src={product.image} alt="" className="h-12 w-12 rounded object-cover" />}<div><p className="font-semibold">{product.title}</p><p className="text-xs text-on-surface-variant">{product.sku || 'No SKU'}</p></div></div></td>
    <td className={`p-3 font-bold ${currentStock <= 0 ? 'text-error' : currentStock <= 5 ? 'text-amber-700' : ''}`}>{currentStock}{product.variants?.some((variant) => variant.sku) && <select aria-label="Inventory variant" value={variantSku} onChange={(event) => setVariantSku(event.target.value)} className="mt-2 block max-w-40 rounded border p-1 text-xs"><option value="">Product total</option>{product.variants.filter((variant) => variant.sku).map((variant) => <option key={variant.sku} value={variant.sku}>{variant.sku}</option>)}</select>}</td>
    <td className="p-3"><form onSubmit={submit} className="flex flex-wrap gap-2"><input aria-label="Stock change" type="number" step="1" required value={delta} onChange={(event) => setDelta(event.target.value)} placeholder="+/- qty" className="w-24 rounded-lg border p-2" /><input aria-label="Adjustment reason" required minLength="3" maxLength="300" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason" className="min-w-36 flex-1 rounded-lg border p-2" /><button disabled={isLoading} className="rounded-lg bg-primary px-3 py-2 text-sm text-white">Adjust</button></form>
      <button type="button" onClick={() => setShowHistory((shown) => !shown)} className="mt-2 text-xs underline">{showHistory ? 'Hide history' : 'View history'}</button>
      {showHistory && history.slice(0, 10).map((entry) => <p key={entry._id} className="mt-2 text-xs text-on-surface-variant">{entry.delta > 0 ? '+' : ''}{entry.delta} · {entry.reason} · {new Date(entry.createdAt).toLocaleDateString()} · {entry.actor?.name || 'Admin'}</p>)}
    </td>
  </tr>;
}

export default function InventoryManager() {
  const [stock, setStock] = useState('');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetInventoryQuery({ stock, search });
  if (isLoading) return <LoadingSpinner />;
  return <section className="space-y-md">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-headline-sm text-primary">Inventory</h1><p className="text-sm text-on-surface-variant">Review stock levels and record each manual adjustment.</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product or SKU" className="rounded-lg border p-2" /></header>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[['Products', data?.summary.total], ['Low stock (1-5)', data?.summary.lowStock], ['Out of stock', data?.summary.outOfStock]].map(([label,value]) => <div key={label} className="rounded-xl border bg-white p-md"><p className="text-sm text-on-surface-variant">{label}</p><p className="mt-1 text-2xl font-bold text-primary">{value ?? 0}</p></div>)}</div>
    <div className="flex justify-end"><select value={stock} onChange={(event) => setStock(event.target.value)} className="rounded-lg border"><option value="">All stock levels</option><option value="low">Low stock</option><option value="out">Out of stock</option></select></div>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-surface-container-low"><tr><th className="p-3">Product</th><th className="p-3">On hand</th><th className="p-3">Stock adjustment and recent movements</th></tr></thead><tbody>{data?.products.map((product) => <ProductInventoryRow key={product._id} product={product} />)}{!data?.products.length && <tr><td colSpan="3" className="p-8 text-center text-on-surface-variant">No products match this filter.</td></tr>}</tbody></table></div>
  </section>;
}
