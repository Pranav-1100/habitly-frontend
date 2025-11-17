'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Sparkles, CheckCircle } from 'lucide-react';
import { templatesApi, habitsApi } from '@/lib/api';
import { useToast } from '@/components/ui/ToastContainer';
import LoadingState from '@/components/ui/LoadingState';

const getCategoryColor = (category) => {
  const colors = {
    'Health': 'bg-green-100 text-green-800',
    'Wellness': 'bg-blue-100 text-blue-800',
    'Personal Development': 'bg-purple-100 text-purple-800',
    'Productivity': 'bg-yellow-100 text-yellow-800',
    'Fitness': 'bg-red-100 text-red-800',
    'Social': 'bg-pink-100 text-pink-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [usingTemplate, setUsingTemplate] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templatesApi.getAll();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.showError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template) => {
    setUsingTemplate(template.id);
    try {
      await templatesApi.use(template.id);
      toast.showSuccess(`Created habit from template: ${template.name}`);
      // Redirect to habits page after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard/habits';
      }, 1500);
    } catch (error) {
      console.error('Error using template:', error);
      toast.showError('Failed to create habit from template');
    } finally {
      setUsingTemplate(null);
    }
  };

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates
    .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
    .filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Habit Templates</h1>
        </div>
        <p className="text-gray-600">
          Quick-start your habits with pre-built templates or create your own
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingState />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all"
            >
              {/* Icon & Category */}
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{template.icon || '📋'}</div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

              {/* Metadata */}
              <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Frequency: <span className="font-medium text-gray-700">{template.frequency}</span>
                </span>
                {!template.is_system && (
                  <span className="text-xs text-blue-600 font-medium">Custom</span>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleUseTemplate(template)}
                disabled={usingTemplate === template.id}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  usingTemplate === template.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {usingTemplate === template.id ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Use Template
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">About Templates</h3>
        <p className="text-sm text-indigo-700 mb-4">
          Templates are pre-configured habits designed by experts to help you build positive routines.
          Click "Use Template" to instantly create a habit based on the template, which you can then customize to fit your needs.
        </p>
        <p className="text-xs text-indigo-600">
          💡 Pro tip: Start with a few templates and gradually build your routine. Consistency is key!
        </p>
      </div>
    </div>
  );
}
