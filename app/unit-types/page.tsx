"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Scale } from "lucide-react";

interface UnitType {
  _id: string;
  name: string;
  abbreviation: string;
}

export default function UnitTypesPage() {
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnitType, setEditingUnitType] = useState<UnitType | null>(null);
  const [formData, setFormData] = useState({ name: "", abbreviation: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUnitTypes();
  }, []);

  const fetchUnitTypes = async () => {
    try {
      const res = await fetch("/api/unit-types");
      if (res.ok) {
        const data = await res.json();
        setUnitTypes(data);
      }
    } catch (error) {
      console.error("Failed to fetch unit types:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (unitType: UnitType | null = null) => {
    if (unitType && "_id" in unitType) {
      setEditingUnitType(unitType);
      setFormData({ name: unitType.name, abbreviation: unitType.abbreviation });
    } else {
      setEditingUnitType(null);
      setFormData({ name: "", abbreviation: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUnitType(null);
    setFormData({ name: "", abbreviation: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingUnitType
        ? `/api/unit-types/${editingUnitType._id}`
        : "/api/unit-types";
      const method = editingUnitType ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchUnitTypes();
        handleCloseModal();
      } else {
        const data = await res.json();
        alert(data.error || "Falha ao salvar tipo de unidade");
      }
    } catch (error) {
      console.error("Failed to save unit type:", error);
      alert("Falha ao salvar tipo de unidade");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este tipo de unidade?"))
      return;

    try {
      const res = await fetch(`/api/unit-types/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUnitTypes();
      } else {
        const data = await res.json();
        alert(data.error || "Falha ao excluir tipo de unidade");
      }
    } catch (error) {
      console.error("Failed to delete unit type:", error);
      alert("Falha ao excluir tipo de unidade");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="h-8 w-8 text-slate-700" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Unidades de Medida
            </h1>
            <p className="mt-2 text-slate-600">
              Gerencie as unidades base para os produtos (ex: Kg, L, g).
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Nova Unidade
        </button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Nome
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Abreviação
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {unitTypes.map((unit) => (
                <tr key={unit._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {unit.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {unit.abbreviation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(unit)}
                      className="text-emerald-600 hover:text-emerald-900 mr-4"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(unit._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {unitTypes.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Nenhuma unidade de medida encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl flex flex-col overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">
                  {editingUnitType
                    ? "Editar Unidade de Medida"
                    : "Nova Unidade de Medida"}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                    placeholder="Ex: Quilograma"
                  />
                </div>
                <div>
                  <label
                    htmlFor="abbreviation"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Abreviação
                  </label>
                  <input
                    type="text"
                    id="abbreviation"
                    required
                    value={formData.abbreviation}
                    onChange={(e) =>
                      setFormData({ ...formData, abbreviation: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                    placeholder="Ex: kg"
                  />
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
