import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronRight,
  AlertCircle,
  X,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Paragraph {
  id: string;
  text: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  createdAt: number;
}

const AdminContent: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParagraph, setEditingParagraph] = useState<Paragraph | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    difficulty: "Medium" as const,
    category: "General"
  });

  const fetchParagraphs = async () => {
    try {
      const response = await fetch("/api/admin/paragraphs", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      setParagraphs(data);
    } catch (err) {
      console.error("Failed to fetch paragraphs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParagraphs();
  }, [adminToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingParagraph 
        ? `/api/admin/paragraphs/${editingParagraph.id}` 
        : "/api/admin/paragraphs";
      const method = editingParagraph ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}` 
        },
        body: JSON.stringify(formData),
      });

      setIsModalOpen(false);
      setEditingParagraph(null);
      setFormData({ text: "", difficulty: "Medium", category: "General" });
      fetchParagraphs();
    } catch (err) {
      console.error("Failed to save paragraph", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this paragraph?")) return;
    try {
      await fetch(`/api/admin/paragraphs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      fetchParagraphs();
    } catch (err) {
      console.error("Failed to delete paragraph", err);
    }
  };

  const openEditModal = (p: Paragraph) => {
    setEditingParagraph(p);
    setFormData({ text: p.text, difficulty: p.difficulty, category: p.category });
    setIsModalOpen(true);
  };

  const filteredParagraphs = paragraphs.filter(p => 
    p.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Management</h1>
          <p className="text-gray-400 mt-2">Manage typing test paragraphs and difficulty levels</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search paragraphs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => {
              setEditingParagraph(null);
              setFormData({ text: "", difficulty: "Medium", category: "General" });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} />
            Add New
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-500 py-12">Loading paragraphs...</div>
        ) : filteredParagraphs.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">No paragraphs found</div>
        ) : (
          filteredParagraphs.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col h-full group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                  p.difficulty === "Easy" ? "bg-green-500/10 text-green-400" :
                  p.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
                  "bg-red-500/10 text-red-400"
                }`}>
                  {p.difficulty}
                </span>
                <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                  {p.category}
                </span>
              </div>
              <p className="text-gray-300 text-sm line-clamp-4 flex-1 mb-6 leading-relaxed">
                {p.text}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <p className="text-gray-500 text-xs">
                  {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEditModal(p)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {editingParagraph ? "Edit Paragraph" : "Add New Paragraph"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Paragraph Text</label>
                  <textarea
                    required
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    rows={8}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Enter the typing test content here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. SSC, Banking, General"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 text-gray-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    {editingParagraph ? "Update Paragraph" : "Create Paragraph"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminContent;
