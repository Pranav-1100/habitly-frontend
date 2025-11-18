'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag as TagIcon, Hash } from 'lucide-react';
import { tagsApi } from '@/lib/api';
import { useToast } from '@/components/ui/ToastContainer';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const TAG_COLORS = [
  { name: 'Gray', value: '#6B7280', bg: 'bg-gray-500', text: 'text-gray-700', badge: 'bg-gray-100' },
  { name: 'Red', value: '#EF4444', bg: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-100' },
  { name: 'Orange', value: '#F97316', bg: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100' },
  { name: 'Yellow', value: '#EAB308', bg: 'bg-yellow-500', text: 'text-yellow-700', badge: 'bg-yellow-100' },
  { name: 'Green', value: '#10B981', bg: 'bg-green-500', text: 'text-green-700', badge: 'bg-green-100' },
  { name: 'Teal', value: '#14B8A6', bg: 'bg-teal-500', text: 'text-teal-700', badge: 'bg-teal-100' },
  { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-100' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500', text: 'text-indigo-700', badge: 'bg-indigo-100' },
  { name: 'Purple', value: '#A855F7', bg: 'bg-purple-500', text: 'text-purple-700', badge: 'bg-purple-100' },
  { name: 'Pink', value: '#EC4899', bg: 'bg-pink-500', text: 'text-pink-700', badge: 'bg-pink-100' },
];

function TagModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    color: TAG_COLORS[0].value,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        color: initialData.color || TAG_COLORS[0].value,
      });
    } else {
      setFormData({
        name: '',
        color: TAG_COLORS[0].value,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error saving tag:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {initialData ? 'Edit Tag' : 'New Tag'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tag Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., urgent, morning, evening"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Color</label>
            <div className="grid grid-cols-5 gap-3">
              {TAG_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`h-12 rounded-lg ${color.bg} transition-transform ${
                    formData.color === color.value
                      ? 'ring-4 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Preview:</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                TAG_COLORS.find(c => c.value === formData.color)?.badge || 'bg-gray-100'
              } ${TAG_COLORS.find(c => c.value === formData.color)?.text || 'text-gray-700'}`}
            >
              <Hash className="w-3 h-3 mr-1" />
              {formData.name || 'tag-name'}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await tagsApi.getAll();
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.showError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedTag) {
        await tagsApi.update(selectedTag.id, data);
        toast.showSuccess('Tag updated successfully');
      } else {
        await tagsApi.create(data);
        toast.showSuccess('Tag created successfully');
      }
      await fetchTags();
      setShowModal(false);
      setSelectedTag(null);
    } catch (error) {
      console.error('Error saving tag:', error);
      toast.showError('Failed to save tag');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!tagToDelete) return;

    setDeleteLoading(true);
    try {
      await tagsApi.delete(tagToDelete.id);
      toast.showSuccess('Tag deleted successfully');
      await fetchTags();
      setShowDeleteConfirm(false);
      setTagToDelete(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.showError('Failed to delete tag');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getColorClasses = (colorValue) => {
    return TAG_COLORS.find(c => c.value === colorValue) || TAG_COLORS[0];
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TagIcon className="w-8 h-8 text-indigo-600" />
            Tags
          </h1>
          <p className="text-gray-600 mt-1">Label your habits and tasks for better organization</p>
        </div>
        <button
          onClick={() => {
            setSelectedTag(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Tag
        </button>
      </div>

      {/* Tags List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tags yet</h3>
          <p className="text-gray-600 mb-4">Create your first tag to label your habits and tasks</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Tag
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tags.map((tag) => {
            const colorClasses = getColorClasses(tag.color);
            return (
              <div
                key={tag.id}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${colorClasses.bg}`}
                  ></div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses.badge} ${colorClasses.text}`}
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    {tag.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {(tag._count?.habits || 0) + (tag._count?.tasks || 0)} items
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedTag(tag);
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Edit tag"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setTagToDelete(tag);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete tag"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tag Modal */}
      <TagModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTag(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedTag}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setTagToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Tag"
        message={`Are you sure you want to delete "${tagToDelete?.name}"? This will remove the tag from all associated items.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
