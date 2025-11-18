'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, StickyNote, X } from 'lucide-react';
import { notesApi } from '@/lib/api';
import { useToast } from '@/components/ui/ToastContainer';
import { format } from 'date-fns';

export default function NotesPanel({ entityType, entityId, entityTitle }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (entityId && entityType) {
      fetchNotes();
    }
  }, [entityId, entityType]);

  const fetchNotes = async () => {
    try {
      const response = await notesApi.getByEntity(entityType, entityId);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      toast.showWarning('Note content cannot be empty');
      return;
    }

    setSaving(true);
    try {
      if (editingNote) {
        await notesApi.update(editingNote.id, { content: noteContent.trim() });
        toast.showSuccess('Note updated');
      } else {
        await notesApi.create({
          entity_type: entityType,
          entity_id: entityId,
          content: noteContent.trim(),
        });
        toast.showSuccess('Note added');
      }
      setNoteContent('');
      setShowAddNote(false);
      setEditingNote(null);
      await fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.showError('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setShowAddNote(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesApi.delete(noteId);
      toast.showSuccess('Note deleted');
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.showError('Failed to delete note');
    }
  };

  const handleCancel = () => {
    setShowAddNote(false);
    setEditingNote(null);
    setNoteContent('');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-indigo-600" />
          Notes
          {entityTitle && <span className="text-sm text-gray-500">for "{entityTitle}"</span>}
        </h3>
        {!showAddNote && (
          <button
            onClick={() => setShowAddNote(true)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        )}
      </div>

      {/* Add/Edit Note Form */}
      {showAddNote && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-indigo-900">
              {editingNote ? 'Edit Note' : 'New Note'}
            </h4>
            <button
              onClick={handleCancel}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write your note here..."
            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={4}
            disabled={saving}
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNote}
              disabled={saving || !noteContent.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : editingNote ? 'Update Note' : 'Add Note'}
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <StickyNote className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">No notes yet</p>
          <p className="text-xs text-gray-500">Add a note to keep track of important information</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500">
                  {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="p-1 text-gray-600 hover:text-indigo-600"
                    title="Edit note"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-gray-600 hover:text-red-600"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.content}</p>
              {note.updated_at && note.updated_at !== note.created_at && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  Updated {format(new Date(note.updated_at), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
