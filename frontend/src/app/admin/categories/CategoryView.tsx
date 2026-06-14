"use client";

import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Search, FolderPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category } from './type';
import api from '@/lib/axios';

export default function CategoryView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/categories');
      setCategories(response.data?.data || response.data || []);
    } catch (error) {
      console.warn("Gagal mengambil data kategori:", (error as any)?.response?.status || (error as any)?.message || error);
    } finally {
      setLoading(false);
    }
  };

  
  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  
  const openEditModal = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name });
    setIsModalOpen(true);
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Nama kategori tidak boleh kosong!");

    setIsSubmitting(true);
    try {
      if (editingId) {
        const response = await api.put(`/admin/categories/${editingId}`, formData);
        const updatedCategory = response.data?.data || response.data;
        setCategories(prev => prev.map(cat => cat.id === editingId ? { ...cat, ...updatedCategory } : cat));
      } else {
        const response = await api.post('/admin/categories', formData);
        const newCategory = response.data?.data || response.data;
        setCategories(prev => [newCategory, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.warn("Gagal menyimpan kategori:", error?.response?.status || error?.message || error);
      
      
      const laravelErrorMessage = error.response?.data?.message || error.response?.data?.error;
      
      if (laravelErrorMessage) {
        alert(`Gagal menyimpan: ${laravelErrorMessage}`);
      } else {
        alert("Terjadi kesalahan sistem (Gagal terhubung ke API Laravel).");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) return;

    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.warn("Gagal menghapus kategori:", (error as any)?.response?.status || (error as any)?.message || error);
      alert("Gagal menghapus, kategori ini mungkin masih digunakan oleh postingan user.");
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FolderTree className="w-6 h-6" style={{ color: '#e95723' }} /> Kelola Kategori
          </h1>
          <p className="text-xs text-gray-400">Buat, ubah, atau hapus taksonomi wadah topik diskusi forum.</p>
        </div>

        <Button 
          onClick={openCreateModal}
          className="bg-[#e95723] hover:bg-[#d4481d] text-white gap-2 text-sm px-4 h-10 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Kategori
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
        <Input
          type="text"
          placeholder="Cari nama kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-[#161b22]/60 border-gray-800 text-gray-200 text-sm placeholder:text-gray-500 focus-visible:ring-[#e95723]/40 h-10 rounded-xl"
        />
      </div>
      <div className="bg-[#161b22]/20 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Memuat daftar kategori...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16 text-gray-500 space-y-2">
            <FolderPlus className="w-8 h-8 mx-auto text-gray-600" />
            <p className="text-sm">Tidak ada kategori ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#161b22]/60 border-b border-gray-800 text-gray-400 font-medium">
                  <th className="p-4 pl-6">Nama Kategori</th>
                  <th className="p-4">Slug URL</th>
                  <th className="p-4 text-center w-36">Jumlah Postingan</th>
                  <th className="p-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#161b22]/30 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-white">
                      {cat.name}
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-500">
                      /{cat.slug}
                    </td>
                    <td className="p-4 text-center font-medium font-mono text-gray-400">
                      {cat.posts_count ?? 0}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          title="Ubah Kategori"
                          className="p-2 text-gray-400 hover:text-orange-400 hover:bg-[#21262d] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          title="Hapus Kategori"
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#21262d] rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#161b22] border border-gray-800 w-full max-w-sm rounded-xl shadow-2xl p-6 relative space-y-4 text-gray-200">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-white rounded-lg p-1 hover:bg-[#21262d]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Ubah Kategori' : 'Tambah Kategori'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Silakan masukkan nama kategori diskusi baru.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">Nama Kategori</label>
                <Input
                  type="text"
                  placeholder="Contoh: PHP Laravel, ReactJS, Roblox"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="bg-[#0d1117] border-gray-800 text-white focus-visible:ring-[#e95723]/40 h-10 rounded-xl"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-800/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-[#21262d] rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#e95723] hover:bg-[#d4481d] text-white rounded-xl text-xs px-4 font-semibold"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}