"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Filter,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPLIERS } from "@/lib/suppliers";
import { ImageUploader } from "@/components/admin/image-uploader";
import { cn, formatPrice, slugify } from "@/lib/utils";
import { notifyAction, notifyError } from "@/lib/ui-actions";
import { useRouter } from "next/navigation";
import {
  productRowToAdminProduct,
  type AdminProduct,
  type ProductRow,
} from "@/lib/admin-products";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "פעיל", color: "bg-green-500/10 text-green-400" },
  draft: { label: "טיוטה", color: "bg-yellow-500/10 text-yellow-400" },
  archived: { label: "ארכיון", color: "bg-white/5 text-white/30" },
};

const CATEGORIES: { value: string; label: string }[] = [
  { value: "rings", label: "טבעות" },
  { value: "earrings", label: "עגילים" },
  { value: "necklaces", label: "שרשראות" },
  { value: "bracelets", label: "צמידים" },
  { value: "piercings", label: "פירסינג" },
];

function createNewProduct(): AdminProduct {
  return {
    id: "",
    slug: "",
    name: "",
    nameEn: "",
    sku: `LJ-${Date.now().toString().slice(-4)}`,
    description: "",
    story: "",
    price: 0,
    stock: 0,
    status: "active",
    category: "rings",
    image: "",
    images: [],
    media: { images: [] },
  };
}

export default function ProductsAdmin() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [saving, setSaving] = useState(false);

  // Load products from DB
  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const res = await fetch("/api/admin/products");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        const payload = (await res.json()) as { products: ProductRow[] };
        if (!mounted) return;
        setProducts(payload.products.map(productRowToAdminProduct));
        setDbError(null);
      } catch (err) {
        if (!mounted) return;
        setDbError(err instanceof Error ? err.message : "שגיאה בטעינת מוצרים");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();
    return () => { mounted = false; };
  }, []);

  const saveProduct = async (product: AdminProduct) => {
    setSaving(true);
    const isNew = !product.id || product.id === "";
    const method = isNew ? "POST" : "PUT";

    // Auto-generate slug from English name if missing
    const productToSave = {
      ...product,
      slug: product.slug || slugify(product.nameEn),
      image: product.images?.[0] ?? product.image ?? "",
    };

    try {
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToSave),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "שגיאה בשמירה");
      }

      const payload = (await res.json()) as { product: ProductRow };
      const savedProduct = productRowToAdminProduct(payload.product);

      setProducts((items) =>
        isNew
          ? [savedProduct, ...items]
          : items.map((item) => (item.id === product.id ? savedProduct : item))
      );
      notifyAction(`${savedProduct.name} נשמר בהצלחה`);
      setEditingProduct(null);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: AdminProduct) => {
    if (!window.confirm(`למחוק את "${product.name}"? פעולה זו בלתי הפיכה.`)) return;

    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });

      if (!res.ok) throw new Error("שגיאה במחיקה");

      setProducts((items) => items.filter((item) => item.id !== product.id));
      notifyAction(`${product.name} נמחק`);
    } catch {
      notifyError("שגיאה במחיקת המוצר");
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.includes(search) ||
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStock = !lowStockOnly || p.stock <= 5;
    return matchesSearch && matchesStock;
  });

  // Get first image for thumbnail
  const getThumb = (p: AdminProduct) =>
    p.images?.[0] ?? p.image ?? p.media?.images?.[0] ?? "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">מוצרים</h1>
          <p className="text-sm text-white/40 mt-1">
            {loading ? "טוען..." : `${products.length} מוצרים`}
          </p>
        </div>
        <Button
          variant="gold"
          size="md"
          onClick={() => setEditingProduct(createNewProduct())}
        >
          <Plus size={16} className="ml-2" />
          הוסף מוצר
        </Button>
      </div>

      {/* DB Error */}
      {dbError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <div>
            <p className="text-sm text-red-400 font-medium">שגיאה בחיבור למסד הנתונים</p>
            <p className="text-xs text-red-400/60 mt-0.5">{dbError}</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            placeholder="חפש מוצר לפי שם, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-charcoal border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors"
          />
        </div>
        <button
          onClick={() => setLowStockOnly((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 bg-charcoal border rounded-lg text-sm transition-colors",
            lowStockOnly
              ? "border-gold/30 text-gold"
              : "border-white/5 text-white/50 hover:text-white hover:border-white/10"
          )}
        >
          <Filter size={14} />
          {lowStockOnly ? "מלאי נמוך" : "סינון"}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gold/50" />
        </div>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && !dbError && (
        <div className="text-center py-20">
          <p className="text-white/30 mb-4">אין מוצרים עדיין</p>
          <Button variant="gold" size="md" onClick={() => setEditingProduct(createNewProduct())}>
            <Plus size={16} className="ml-2" />
            הוסף מוצר ראשון
          </Button>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-charcoal border border-white/5 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                  מוצר
                </th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                  SKU
                </th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                  מחיר
                </th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                  מלאי
                </th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                  סטטוס
                </th>
                <th className="text-right px-5 py-3 text-[10px] text-white/30 tracking-wider uppercase font-medium">
                  קטגוריה
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((product) => {
                const thumb = getThumb(product);
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => setEditingProduct({ ...product })}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={product.name}
                            className="w-10 h-10 rounded-sm object-cover bg-smoke shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-smoke rounded-sm shrink-0 flex items-center justify-center">
                            <span className="text-[8px] text-white/20">אין</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-white/80">{product.name}</p>
                          <p className="text-[10px] text-white/30">{product.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-white/40 font-mono">{product.sku}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gold">{formatPrice(product.price)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "text-sm",
                          product.stock === 0
                            ? "text-red-400"
                            : product.stock <= 5
                            ? "text-yellow-400"
                            : "text-white/60"
                        )}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px]",
                          STATUS_MAP[product.status]?.color ?? "text-white/30"
                        )}
                      >
                        {STATUS_MAP[product.status]?.label ?? product.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-white/40">
                        {CATEGORIES.find((c) => c.value === product.category)?.label ?? product.category}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          setActiveMenu(activeMenu === product.id ? null : product.id)
                        }
                        className="p-1 text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeMenu === product.id && (
                        <div className="absolute left-0 top-full mt-1 bg-smoke border border-white/10 rounded-lg py-1 min-w-[140px] z-50 shadow-xl">
                          <button
                            onClick={() => {
                              setEditingProduct({ ...product });
                              setActiveMenu(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Edit size={12} />
                            ערוך
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenu(null);
                              router.push(`/products/${product.slug ?? slugify(product.nameEn)}`);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Eye size={12} />
                            צפה
                          </button>
                          <button
                            onClick={() => {
                              const copy = createNewProduct();
                              copy.name = `${product.name} עותק`;
                              copy.nameEn = `${product.nameEn} Copy`;
                              copy.sku = `${product.sku}-COPY`;
                              copy.price = product.price;
                              copy.category = product.category;
                              copy.description = product.description;
                              copy.story = product.story;
                              copy.material = product.material;
                              copy.images = [...(product.images ?? [])];
                              copy.media = { ...product.media };
                              setEditingProduct(copy);
                              setActiveMenu(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Copy size={12} />
                            שכפל
                          </button>
                          <div className="border-t border-white/5 my-1" />
                          <button
                            onClick={() => {
                              deleteProduct(product);
                              setActiveMenu(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={12} />
                            מחק
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          saving={saving}
          onChange={setEditingProduct}
          onSave={saveProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-white/5 bg-smoke/30 p-5", className)}>
      <h3 className="text-[11px] text-gold/70 tracking-wider uppercase font-medium mb-4">
        {title}
      </h3>
      {children}
    </section>
  );
}

// ─── Edit Modal ───────────────────────────────────────────

function EditProductModal({
  product,
  saving,
  onChange,
  onSave,
  onClose,
}: {
  product: AdminProduct;
  saving: boolean;
  onChange: (p: AdminProduct) => void;
  onSave: (p: AdminProduct) => void;
  onClose: () => void;
}) {
  const isNew = !product.id || product.id === "";
  const productSlug = product.slug || slugify(product.nameEn) || "new-product";

  const update = <K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) => {
    onChange({ ...product, [key]: value });
  };

  const inputClass =
    "w-full rounded-md bg-charcoal border border-white/8 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/10 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-3xl rounded-xl border border-gold/10 bg-charcoal shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-medium text-white">
              {isNew ? "מוצר חדש" : "עריכת מוצר"}
            </h2>
            {!isNew && (
              <p className="text-xs text-white/30 mt-0.5">
                {product.name} · <span className="font-mono">{product.sku}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors rounded-md hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          className="space-y-5 p-6 overflow-y-auto flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(product);
          }}
        >
          {/* ═══ IMAGES ═══ */}
          <SectionCard title="תמונות מוצר">
            <ImageUploader
              productSlug={productSlug}
              images={product.images ?? []}
              onChange={(images) => {
                onChange({
                  ...product,
                  images,
                  image: images[0] ?? "",
                  media: { ...product.media, images },
                });
              }}
              maxImages={8}
            />
          </SectionCard>

          {/* ═══ PRODUCT IDENTITY ═══ */}
          <SectionCard title="זיהוי מוצר">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">שם בעברית *</span>
                <input
                  required
                  value={product.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">שם באנגלית *</span>
                <input
                  required
                  value={product.nameEn}
                  onChange={(e) => {
                    onChange({
                      ...product,
                      nameEn: e.target.value,
                      slug: product.slug || slugify(e.target.value),
                    });
                  }}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">SKU *</span>
                <input
                  required
                  value={product.sku}
                  onChange={(e) => update("sku", e.target.value)}
                  className={cn(inputClass, "font-mono text-xs")}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">Slug (URL)</span>
                <input
                  value={product.slug ?? ""}
                  onChange={(e) => update("slug", e.target.value)}
                  placeholder="ייווצר אוטומטית מהשם באנגלית"
                  className={cn(inputClass, "font-mono text-xs")}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">קטגוריה *</span>
                <select
                  value={product.category}
                  onChange={(e) => update("category", e.target.value)}
                  className={inputClass}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">מגדר *</span>
                <select
                  value={product.gender ?? "women"}
                  onChange={(e) => update("gender", e.target.value as AdminProduct["gender"])}
                  className={inputClass}
                >
                  <option value="women">לאישה</option>
                  <option value="men">לגבר</option>
                  <option value="unisex">יוניסקס</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">סטטוס</span>
                <select
                  value={product.status}
                  onChange={(e) => update("status", e.target.value as AdminProduct["status"])}
                  className={inputClass}
                >
                  <option value="active">פעיל</option>
                  <option value="draft">טיוטה</option>
                  <option value="archived">ארכיון</option>
                </select>
              </label>
            </div>
          </SectionCard>

          {/* ═══ PRICING & INVENTORY ═══ */}
          <SectionCard title="מחיר ומלאי">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">מחיר (₪) *</span>
                <input
                  type="number"
                  required
                  min={0}
                  value={product.price}
                  onChange={(e) => update("price", Number(e.target.value))}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">מחיר לפני הנחה (₪)</span>
                <input
                  type="number"
                  min={0}
                  value={product.compareAtPrice ?? ""}
                  onChange={(e) =>
                    update("compareAtPrice", e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="אופציונלי"
                  className={inputClass}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">מלאי *</span>
                <input
                  type="number"
                  required
                  min={0}
                  value={product.stock}
                  onChange={(e) => update("stock", Number(e.target.value))}
                  className={inputClass}
                />
              </label>
            </div>
          </SectionCard>

          {/* ═══ MATERIALS & SPECS ═══ */}
          <SectionCard title="חומרים ומפרט">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">חומר</span>
                <input
                  value={product.material ?? ""}
                  onChange={(e) => update("material", e.target.value)}
                  placeholder="מצופה זהב, כסף 925..."
                  className={inputClass}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">צבע</span>
                <input
                  value={product.color ?? ""}
                  onChange={(e) => update("color", e.target.value)}
                  placeholder="זהב, כסף, רוז גולד..."
                  className={inputClass}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">אבן חן</span>
                <input
                  value={product.gemstone ?? ""}
                  onChange={(e) => update("gemstone", e.target.value)}
                  placeholder="זרקון, אבן טבעית..."
                  className={inputClass}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">משקל</span>
                <input
                  value={product.weight ?? ""}
                  onChange={(e) => update("weight", e.target.value)}
                  placeholder="3.5g, 0.5ct..."
                  className={inputClass}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-white/50">ספק</span>
                <select
                  value={product.options?.supplier ?? ""}
                  onChange={(e) =>
                    update("options", {
                      colors: product.options?.colors ?? [],
                      sizes: product.options?.sizes ?? [],
                      supplier: e.target.value || undefined,
                    })
                  }
                  className={inputClass}
                >
                  <option value="">— ללא ספק —</option>
                  {SUPPLIERS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </SectionCard>

          {/* ═══ DESCRIPTION & STORY ═══ */}
          <SectionCard title="תיאור וסיפור">
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs text-white/50">תיאור המוצר</span>
                <textarea
                  rows={3}
                  value={product.description ?? ""}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="תיאור קצר של המוצר..."
                  className={`${inputClass} resize-none`}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-white/50">הסיפור מאחורי התכשיט</span>
                <textarea
                  rows={3}
                  value={product.story ?? ""}
                  onChange={(e) => update("story", e.target.value)}
                  placeholder="הסיפור והמוטיבציה..."
                  className={`${inputClass} resize-none`}
                />
              </label>
            </div>
          </SectionCard>

          {/* ═══ FLAGS & TAGS ═══ */}
          <SectionCard title="תגיות ונראות">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={product.isNew ?? false}
                  onChange={(e) => update("isNew", e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-charcoal accent-[#B89B5E]"
                />
                <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">מוצר חדש</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={product.isFeatured ?? false}
                  onChange={(e) => update("isFeatured", e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-charcoal accent-[#B89B5E]"
                />
                <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">מוצר מומלץ</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={product.isLimited ?? false}
                  onChange={(e) => update("isLimited", e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-charcoal accent-[#B89B5E]"
                />
                <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">מהדורה מוגבלת</span>
              </label>
            </div>
          </SectionCard>

          {/* ═══ ACTIONS ═══ */}
          <div className="flex items-center justify-between pt-2 sticky bottom-0 bg-charcoal pb-1">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" variant="gold" size="md" loading={saving}>
              {isNew ? "צור מוצר" : "שמור שינויים"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
