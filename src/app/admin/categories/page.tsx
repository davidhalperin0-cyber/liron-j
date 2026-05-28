"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  GripVertical,
  Package,
  Upload,
  X,
  Loader2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notifyAction, notifyError } from "@/lib/ui-actions";

interface Category {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  description: string;
  image_url: string;
  sort_order: number;
  status: string;
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const payload = await res.json();
      setCategories(payload.categories ?? []);
      setDbError(null);
    } catch (err) {
      setDbError(err instanceof Error ? err.message : "שגיאה בטעינת קטגוריות");
    } finally {
      setLoading(false);
    }
  }

  async function saveCategory(cat: Category) {
    setSaving(true);
    const isNew = !cat.id;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "שגיאה בשמירה");
      }

      const payload = await res.json();
      const saved = payload.category;

      setCategories((items) =>
        isNew
          ? [...items, saved]
          : items.map((item) => (item.id === saved.id ? saved : item))
      );
      notifyAction(`${saved.name} נשמר בהצלחה`);
      setEditing(null);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(cat: Category) {
    if (!window.confirm(`למחוק את "${cat.name}"?`)) return;

    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id }),
      });
      if (!res.ok) throw new Error("שגיאה במחיקה");
      setCategories((items) => items.filter((item) => item.id !== cat.id));
      notifyAction(`${cat.name} נמחק`);
    } catch {
      notifyError("שגיאה במחיקת קטגוריה");
    }
  }

  const filtered = categories.filter(
    (c) =>
      c.name.includes(search) ||
      c.name_en.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">קטגוריות</h1>
          <p className="text-sm text-white/40 mt-1">
            {loading ? "טוען..." : `${categories.length} קטגוריות`}
          </p>
        </div>
        <Button
          variant="gold"
          size="md"
          onClick={() =>
            setEditing({
              id: "",
              slug: "",
              name: "",
              name_en: "",
              description: "",
              image_url: "",
              sort_order: categories.length + 1,
              status: "active",
            })
          }
        >
          <Plus size={16} className="ml-2" />
          הוסף קטגוריה
        </Button>
      </div>

      {/* DB Error */}
      {dbError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{dbError}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="חפש קטגוריה..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 bg-charcoal border border-white/5 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 transition-colors"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gold/50" />
        </div>
      )}

      {/* Categories List */}
      {!loading && filtered.length > 0 && (
        <div className="bg-charcoal border border-white/5 rounded-lg overflow-hidden">
          <div className="divide-y divide-white/5">
            {filtered.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                onClick={() => setEditing({ ...category })}
              >
                <GripVertical size={16} className="text-white/10 cursor-grab shrink-0" />

                {/* Category Image Thumbnail */}
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-12 h-12 rounded-md object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-smoke border border-white/5 flex items-center justify-center shrink-0">
                    <ImageIcon size={16} className="text-white/15" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80">{category.name}</p>
                  <p className="text-[10px] text-white/30">
                    {category.name_en} · /{category.slug}
                  </p>
                </div>

                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] shrink-0",
                    category.status === "active"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  )}
                >
                  {category.status === "active" ? "פעיל" : "טיוטה"}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing({ ...category });
                    }}
                    className="p-1.5 text-white/30 hover:text-white transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(category);
                    }}
                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && categories.length === 0 && !dbError && (
        <div className="text-center py-20">
          <p className="text-white/30 mb-4">אין קטגוריות עדיין</p>
          <p className="text-xs text-white/20">הריצי את migrate-categories-table.sql ב-Supabase</p>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <CategoryEditModal
          category={editing}
          saving={saving}
          onChange={setEditing}
          onSave={saveCategory}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

// ─── Category Edit Modal ──────────────────────────────────

function CategoryEditModal({
  category,
  saving,
  onChange,
  onSave,
  onClose,
}: {
  category: Category;
  saving: boolean;
  onChange: (c: Category) => void;
  onSave: (c: Category) => void;
  onClose: () => void;
}) {
  const isNew = !category.id;
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputClass =
    "w-full rounded-md bg-smoke border border-white/8 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/10 transition-all";

  const uploadImage = useCallback(
    async (file: File) => {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productSlug", `category-${category.slug || "new"}`);

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Upload failed");
        }

        const data = await res.json();
        onChange({ ...category, image_url: data.publicUrl });
      } catch (err) {
        notifyError(err instanceof Error ? err.message : "שגיאה בהעלאה");
      } finally {
        setUploading(false);
      }
    },
    [category, onChange]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg rounded-xl border border-gold/10 bg-charcoal shadow-2xl max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 shrink-0">
          <h2 className="text-lg font-medium text-white">
            {isNew ? "קטגוריה חדשה" : `עריכת "${category.name}"`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white transition-colors rounded-md hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          className="space-y-5 p-6 overflow-y-auto flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(category);
          }}
        >
          {/* Image Upload */}
          <div className="space-y-2">
            <span className="text-xs text-white/50">תמונת קטגוריה (Hero Banner)</span>
            {category.image_url ? (
              <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-[3/1]">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
                  >
                    החלף תמונה
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...category, image_url: "" })}
                    className="px-3 py-1.5 text-xs bg-red-500/60 hover:bg-red-500/80 rounded text-white transition-colors"
                  >
                    הסר
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors aspect-[3/1] flex flex-col items-center justify-center",
                  "border-white/15 hover:border-gold/30 hover:bg-gold/[0.02]"
                )}
              >
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-gold/50" />
                ) : (
                  <>
                    <Upload size={24} className="text-white/30 mb-2" />
                    <span className="text-sm text-white/40">לחצי להעלאת תמונה</span>
                    <span className="text-[10px] text-white/20 mt-1">
                      מומלץ: 1200×400px · JPG, PNG, WebP
                    </span>
                  </>
                )}
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
                e.target.value = "";
              }}
            />
          </div>

          {/* Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs text-white/50">שם בעברית *</span>
              <input
                required
                value={category.name}
                onChange={(e) => onChange({ ...category, name: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-white/50">שם באנגלית *</span>
              <input
                required
                value={category.name_en}
                onChange={(e) => {
                  const name_en = e.target.value;
                  onChange({
                    ...category,
                    name_en,
                    slug: category.slug || name_en.toLowerCase().replace(/\s+/g, "-"),
                  });
                }}
                className={inputClass}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-white/50">Slug *</span>
              <input
                required
                value={category.slug}
                onChange={(e) => onChange({ ...category, slug: e.target.value })}
                placeholder="rings, earrings..."
                className={cn(inputClass, "font-mono text-xs")}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-white/50">סדר מיון</span>
              <input
                type="number"
                min={0}
                value={category.sort_order}
                onChange={(e) => onChange({ ...category, sort_order: Number(e.target.value) })}
                className={inputClass}
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs text-white/50">תיאור</span>
            <textarea
              rows={2}
              value={category.description}
              onChange={(e) => onChange({ ...category, description: e.target.value })}
              placeholder="תיאור קצר של הקטגוריה..."
              className={`${inputClass} resize-none`}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-white/50">סטטוס</span>
            <select
              value={category.status}
              onChange={(e) => onChange({ ...category, status: e.target.value })}
              className={inputClass}
            >
              <option value="active">פעיל</option>
              <option value="draft">טיוטה</option>
            </select>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" variant="gold" size="md" loading={saving}>
              {isNew ? "צור קטגוריה" : "שמור שינויים"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
