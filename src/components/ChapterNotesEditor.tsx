import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, Eye, FileText, Pencil, Search } from 'lucide-react';
import { useLMS } from '../store/LMSContext';

interface ChapterNotesEditorProps {
  moduleId: string;
  chapterId: string;
  chapterTitle: string;
}

export const ChapterNotesEditor: React.FC<ChapterNotesEditorProps> = ({
  moduleId,
  chapterId,
  chapterTitle,
}) => {
  const { state, currentUser, saveChapterNote } = useLMS();

  const existingNote = useMemo(
    () =>
      state.notes.find(
        (n) =>
          n.userId === currentUser?.id &&
          n.moduleId === moduleId &&
          n.chapterId === chapterId
      ),
    [state.notes, currentUser?.id, moduleId, chapterId]
  );

  const [draft, setDraft] = useState(existingNote?.content || '');
  const [previewMode, setPreviewMode] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');

  useEffect(() => {
    setDraft(existingNote?.content || '');
    setSaveState('saved');
  }, [moduleId, chapterId, existingNote?.id]);

  const handleChange = (value: string) => {
    setDraft(value);
    setSaveState('saving');
    saveChapterNote(moduleId, chapterId, value);
    window.setTimeout(() => setSaveState('saved'), 250);
  };

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-[8px] flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[#E4E4E7] flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#09090B]">
            <FileText className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span>Private Chapter Notes</span>
          </div>
          <div className="text-[11px] text-[#71717A] truncate">{chapterTitle}</div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#71717A]">
            <Check className="w-3 h-3" strokeWidth={1.5} />
            {saveState === 'saving' ? 'Saving...' : 'Saved'}
          </span>
          <button
            type="button"
            onClick={() => setPreviewMode((p) => !p)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] border border-[#E4E4E7] bg-[#FAFAFA] hover:bg-[#F4F4F5] text-[11px] font-medium text-[#09090B]"
          >
            {previewMode ? (
              <>
                <Pencil className="w-3 h-3" strokeWidth={1.5} />
                <span>Edit</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" strokeWidth={1.5} />
                <span>Preview</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {previewMode ? (
          <div className="flex-1 min-h-[260px] prose prose-sm max-w-none text-[13px] leading-relaxed text-[#09090B] whitespace-pre-wrap font-sans">
            {draft.trim() ? (
              draft
            ) : (
              <span className="text-[#71717A]">
                No notes recorded for this chapter yet. Switch to Edit to start writing.
              </span>
            )}
          </div>
        ) : (
          <textarea
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Record architecture takeaways, CLI commands, or questions for this chapter (Markdown supported, auto-saved)..."
            className="flex-1 w-full min-h-[260px] resize-y p-3 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] focus:bg-white focus:border-[#09090B] font-mono text-[12px] leading-relaxed text-[#09090B] focus:outline-none"
          />
        )}

        <div className="mt-3 pt-2.5 border-t border-[#E4E4E7] flex items-center justify-between text-[11px] text-[#71717A] font-mono tabular-nums">
          <span>{draft.length} chars</span>
          <span>
            {existingNote?.updatedAt
              ? `Updated ${new Date(existingNote.updatedAt).toLocaleDateString()}`
              : 'Bound to chapter'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PrivateNotesIndex: React.FC = () => {
  const { state, currentUser, saveChapterNote, navigate } = useLMS();
  const [query, setQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const userNotes = useMemo(() => {
    if (!currentUser) return [];
    return state.notes
      .filter((n) => n.userId === currentUser.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((note) => {
        const mod = state.modules.find((m) => m.id === note.moduleId);
        const ch = mod?.chapters.find((c) => c.id === note.chapterId);
        return {
          ...note,
          moduleTitle: mod?.title || 'Unknown Module',
          moduleCode: mod?.code || '',
          chapterTitle: ch?.title || 'Unknown Chapter',
        };
      });
  }, [state.notes, state.modules, currentUser]);

  const filteredNotes = useMemo(() => {
    if (!query.trim()) return userNotes;
    const q = query.toLowerCase();
    return userNotes.filter(
      (n) =>
        n.content.toLowerCase().includes(q) ||
        n.moduleTitle.toLowerCase().includes(q) ||
        n.chapterTitle.toLowerCase().includes(q)
    );
  }, [userNotes, query]);

  const activeNote =
    filteredNotes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#E4E4E7]">
        <div>
          <h1 className="font-display font-semibold text-[26px] text-[#09090B]">
            Private Notes Index
          </h1>
          <p className="text-[14px] text-[#71717A] mt-1">
            Review, search, and edit all private notes saved across your modules and chapters.
          </p>
        </div>

        <div className="relative w-full md:w-[280px]">
          <Search
            className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search private notes..."
            className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-[#E4E4E7] bg-white text-[13px] focus:outline-none focus:border-[#09090B]"
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-10 text-center">
          <FileText className="w-8 h-8 text-[#71717A] mx-auto mb-3" strokeWidth={1.5} />
          <div className="text-[15px] font-medium text-[#09090B]">
            No private notes yet
          </div>
          <p className="text-[13px] text-[#71717A] mt-1">
            Open any chapter in My Learning to write notes bound to that lesson.
          </p>
          <button
            type="button"
            onClick={() => navigate('/my-learning')}
            className="mt-4 px-4 py-2 rounded-[6px] bg-[#09090B] text-white text-[13px] font-medium"
          >
            Go to My Learning
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 space-y-2.5">
            {filteredNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full text-left p-4 rounded-[8px] border transition-colors ${
                    isSelected
                      ? 'bg-[#09090B] text-white border-[#09090B]'
                      : 'bg-white text-[#09090B] border-[#E4E4E7] hover:border-[#09090B]/50'
                  }`}
                >
                  <div
                    className={`text-[11px] font-mono ${
                      isSelected ? 'text-zinc-400' : 'text-[#71717A]'
                    }`}
                  >
                    {note.moduleCode} · {note.moduleTitle}
                  </div>
                  <div className="font-display font-semibold text-[15px] mt-1">
                    {note.chapterTitle}
                  </div>
                  <div
                    className={`text-[12px] mt-1.5 line-clamp-2 ${
                      isSelected ? 'text-zinc-300' : 'text-[#71717A]'
                    }`}
                  >
                    {note.content.replace(/[#*`]/g, '') || 'Empty note'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7">
            {activeNote && (
              <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 space-y-4">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
                  <div>
                    <div className="text-[12px] font-mono text-[#71717A]">
                      {activeNote.moduleCode} · {activeNote.moduleTitle}
                    </div>
                    <h2 className="font-display font-semibold text-[18px] text-[#09090B] mt-0.5">
                      {activeNote.chapterTitle}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/module/${activeNote.moduleId}?chapter=${activeNote.chapterId}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E4E7] hover:border-[#09090B] text-[12px] font-medium text-[#09090B] whitespace-nowrap shrink-0"
                  >
                    <span>Open Chapter</span>
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>

                <textarea
                  rows={12}
                  value={activeNote.content}
                  onChange={(e) =>
                    saveChapterNote(
                      activeNote.moduleId,
                      activeNote.chapterId,
                      e.target.value
                    )
                  }
                  className="w-full p-3.5 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] focus:bg-white focus:border-[#09090B] font-mono text-[13px] leading-relaxed text-[#09090B] focus:outline-none"
                />
                <div className="text-[11px] font-mono text-[#71717A] flex justify-between">
                  <span>Auto-saved to workspace storage</span>
                  <span>
                    Last edited {new Date(activeNote.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
