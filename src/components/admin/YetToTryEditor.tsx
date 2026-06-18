"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { YetToTry } from "@/lib/types/cafe";
import {
  createYetToTry,
  updateYetToTry,
  deleteYetToTry,
  reorderYetToTry,
} from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm outline-none focus:border-copper";

export function YetToTryEditor({ items }: { items: YetToTry[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("Jeddah");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");

  function handleAdd() {
    startTransition(async () => {
      const result = await createYetToTry(newName, newCity);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        setNewName("");
        setError("");
      }
    });
  }

  function startEdit(item: YetToTry) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditCity(item.city);
    setError("");
  }

  function handleSaveEdit(id: string) {
    startTransition(async () => {
      const result = await updateYetToTry(id, editName, editCity);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        setEditingId(null);
        setError("");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this item from Yet to Try?")) return;
    startTransition(async () => {
      const result = await deleteYetToTry(id);
      if ("error" in result && result.error) setError(result.error);
    });
  }

  function handleReorder(id: string, direction: "up" | "down") {
    startTransition(async () => {
      const result = await reorderYetToTry(id, direction);
      if ("error" in result && result.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-cream-dark bg-white p-4">
        <h3 className="mb-3 text-sm font-medium text-espresso">Add to Yet to Try</h3>
        <div className="flex flex-wrap gap-2">
          <input
            className={inputClass}
            placeholder="Café name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <select
            className={cn(inputClass, "w-auto min-w-[120px]")}
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
          >
            <option value="Jeddah">Jeddah</option>
            <option value="Riyadh">Riyadh</option>
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={pending || !newName.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-espresso px-4 py-2 text-sm font-medium text-cream disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-xl border border-cream-dark bg-white px-4 py-3"
          >
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                disabled={pending || index === 0}
                onClick={() => handleReorder(item.id, "up")}
                className="text-espresso/40 hover:text-espresso disabled:opacity-30"
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={pending || index === items.length - 1}
                onClick={() => handleReorder(item.id, "down")}
                className="text-espresso/40 hover:text-espresso disabled:opacity-30"
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {editingId === item.id ? (
              <div className="flex flex-1 flex-wrap gap-2">
                <input
                  className={inputClass}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <select
                  className={cn(inputClass, "w-auto min-w-[100px]")}
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                >
                  <option value="Jeddah">Jeddah</option>
                  <option value="Riyadh">Riyadh</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(item.id)}
                  disabled={pending}
                  className="rounded-lg bg-espresso px-3 py-2 text-sm text-cream"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-lg border border-cream-dark px-3 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <p className="font-medium text-espresso">{item.name}</p>
                  <p className="text-xs text-espresso/50">{item.city}</p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="text-sm text-copper hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={pending}
                  className="text-espresso/40 hover:text-red-600 disabled:opacity-50"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-espresso/50">No items yet. Add cafés you plan to visit.</p>
        )}
      </ul>
    </div>
  );
}
