import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import QuantityInput from '../components/ui/QuantityInput';
import { productApi } from '../api/productApi';
import { formatCurrency, stockLabel } from '../utils/format';
import { getCategoryIcon } from '../utils/categoryIcons';
import { useCart } from '../hooks/useCart';

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    productApi
      .getById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="text-subtle">ไม่พบสินค้านี้ อาจถูกลบหรือหมดจำหน่ายแล้ว</p>
        <Link to="/products" className="mt-4 inline-block text-cyan hover:underline">
          กลับไปหน้าสินค้าทั้งหมด
        </Link>
      </div>
    );
  }

  const stock = stockLabel(product.stock_qty, product.min_stock ?? 5);
  const Icon = getCategoryIcon(product.category?.name);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link to="/products" className="text-sm text-subtle hover:text-cyan">
        ← กลับไปหน้าสินค้าทั้งหมด
      </Link>

      <Card className="mt-6 grid gap-8 p-8 md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <div className="relative grid aspect-square place-items-center rounded-2xl border border-line bg-black/[0.02]">
            <Icon size={96} />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-faint">{product.category?.name}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">{product.name}</h1>
          {product.brand && <p className="mt-1 text-subtle">{product.brand}</p>}

          <div className="mt-4">
            <Badge tone={stock.tone}>{stock.text}</Badge>
          </div>

          <p className="mt-5 text-subtle">{product.description}</p>

          <p className="mt-6 font-display text-4xl font-extrabold text-ink glow-text">
            {formatCurrency(product.price)}
            <span className="ml-2 text-base font-normal text-subtle">ต่อ{product.unit?.name}</span>
          </p>

          <div className="mt-8 flex items-center gap-4">
            <QuantityInput value={qty} onChange={setQty} max={product.stock_qty} />
            <Button
              disabled={product.stock_qty <= 0}
              className="px-8 py-3.5 disabled:cursor-not-allowed disabled:opacity-30"
              onClick={() => {
                add(
                  {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    unit: product.unit?.name,
                    stock_qty: product.stock_qty,
                  },
                  qty
                );
                setAdded(true);
                setTimeout(() => setAdded(false), 1800);
              }}
            >
              {added ? 'เพิ่มแล้ว ✓' : 'เพิ่มลงตะกร้า'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
