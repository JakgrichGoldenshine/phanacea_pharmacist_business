import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import { productApi } from '../api/productApi';

const PAGE_SIZE = 12;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.categories().then((res) => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  // Any filter change resets back to page 1
  useEffect(() => {
    setPage(1);
  }, [categoryId, search]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      const next = {};
      if (categoryId) next.category = categoryId;
      if (search) next.search = search;
      if (page > 1) next.page = page;
      setSearchParams(next, { replace: true });

      productApi
        .list({ category: categoryId || undefined, search: search || undefined, page, limit: PAGE_SIZE })
        .then((res) => {
          setProducts(res.items);
          setTotal(res.total);
        })
        .catch(() => {
          setProducts([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
    }, 250); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, search, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-10">
      <h1 className="font-display text-3xl font-bold text-ink">สินค้าทั้งหมด</h1>
      <p className="mt-2 text-subtle">ค้นหาและกรองตามหมวดหมู่ยาและผลิตภัณฑ์สุขภาพ</p>

      <div className="mt-8 flex flex-col gap-4 md:flex-row">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-black/[0.03] px-4 py-3 md:max-w-sm md:flex-1">
          <Search size={18} className="shrink-0 text-faint" />
          <input
            className="w-full bg-transparent text-ink outline-none placeholder:text-faint"
            placeholder="ค้นหาชื่อสินค้า เช่น Paracetamol"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="field md:max-w-xs" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="" className="bg-panel">ทุกหมวดหมู่</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-panel">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-10">
        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-subtle">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-faint">พบ {total} รายการ</p>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
