import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Badge from './ui/Badge';
import { formatCurrency, stockLabel } from '../utils/format';
import { getCategoryIcon } from '../utils/categoryIcons';
import { useCart } from '../hooks/useCart';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const stock = stockLabel(product.stock_qty, product.min_stock ?? 5);
  const Icon = getCategoryIcon(product.category?.name);

  return (
    <div className="card group flex flex-col overflow-hidden">
      <span className="hud-edge" />
      <Link to={`/products/${product.id}`} className="relative flex aspect-square items-center justify-center bg-black/[0.02]">
        <Icon size={56} className="transition-transform duration-300 group-hover:scale-110" />
        <span className="absolute left-3 top-3">
          <Badge tone={stock.tone}>{stock.text}</Badge>
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs text-faint">{product.category?.name}</p>
        <Link to={`/products/${product.id}`} className="font-display font-semibold text-ink hover:text-cyan">
          {product.name}
        </Link>
        {product.brand && <p className="text-xs text-subtle">{product.brand}</p>}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="font-display text-lg font-bold text-ink">{formatCurrency(product.price)}</p>
            <p className="text-[11px] text-faint">ต่อ{product.unit?.name || 'หน่วย'}</p>
          </div>
          <button
            disabled={product.stock_qty <= 0}
            aria-label="เพิ่มลงตะกร้า"
            className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r from-cyan to-blue text-void shadow-glowBtn transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
            onClick={() =>
              add({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                unit: product.unit?.name,
                stock_qty: product.stock_qty,
              })
            }
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
