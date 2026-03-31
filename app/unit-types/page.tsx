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

  const handleOpenModal = (unitType?: UnitType) => {
    if (unitType) {
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
          onClick={() => handleOpenModal()}
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseModal}
            ></div>
            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">
                    {editingUnitType
                      ? "Editar Unidade de Medida"
                      : "Nova Unidade de Medida"}
                  </h3>
                  <div className="space-y-4">
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
                          setFormData({
                            ...formData,
                            abbreviation: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                        placeholder="Ex: kg"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
