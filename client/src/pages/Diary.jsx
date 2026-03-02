import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, X, Smile, Meh, Frown, Zap, Coffee, Trash2, Calendar,
  Search, LayoutGrid, List, Filter
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { format } from 'date-fns';

const moodConfig = {
  happy: { icon: Smile, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: 'Great' },
  neutral: { icon: Meh, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', label: 'Okay' },
  stressed: { icon: Frown, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', label: 'Stressed' },
  excited: { icon: Zap, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', label: 'Excited' },
  tired: { icon: Coffee, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', label: 'Tired' },
};

const Diary = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- NEW: Organization State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'happy', 'neutral', etc.
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // --- FORM STATE ---
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState('neutral');

  useEffect(() => {
    let isMounted = true;

    const loadEntries = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('personal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'journal')
        .order('created_at', { ascending: false });

      if (!isMounted) return;
      if (!error) setEntries(data);
      setLoading(false);
    };

    loadEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('personal_entries').insert([{
      user_id: user.id,
      content,
      mood: selectedMood,
      type: 'journal',
      is_private: true
    }]).select();
    if (!error) {
      setEntries([data[0], ...entries]);
      setIsModalOpen(false);
      setContent("");
      setSelectedMood('neutral');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this memory?")) return;
    const { error } = await supabase.from('personal_entries').delete().eq('id', id);
    if (!error) setEntries(entries.filter(e => e.id !== id));
  };

  // --- NEW: Filtering Logic ---
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = entry.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMood = activeFilter === 'all' || entry.mood === activeFilter;
      return matchesSearch && matchesMood;
    });
  }, [entries, searchQuery, activeFilter]);

  return (
    <div className="p-4 md:p-8 pb-24 space-y-8">

      {/* HEADER & ACTIONS */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Personal Journal</h1>
          <p className="text-text-muted mt-1">Capture your ideas, feelings, and daily reflections.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-95">
          <Plus size={20} /> New Entry
        </button>
      </div>

      {/* --- NEW: ORGANIZATION TOOLBAR --- */}
      <div className="max-w-5xl mx-auto bg-surface border border-border rounded-2xl p-2 md:p-3 shadow-sm flex flex-col md:flex-row gap-3">

        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-text-main text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {/* Mood Filters */}
          <div className="flex bg-background border border-border rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-surface-highlight text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              All
            </button>
            {Object.keys(moodConfig).map(mood => (
              <button
                key={mood}
                onClick={() => setActiveFilter(mood)}
                className={`p-1.5 rounded-lg transition-all ${activeFilter === mood ? 'bg-surface-highlight shadow-sm' : 'hover:bg-surface-highlight/50 opacity-50 hover:opacity-100'}`}
                title={moodConfig[mood].label}
              >
                {React.createElement(moodConfig[mood].icon, {
                  size: 16,
                  className: activeFilter === mood ? 'text-primary' : 'text-text-muted'
                })}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex bg-background border border-border rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-surface-highlight text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-surface-highlight text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20 text-text-muted animate-pulse">Loading your thoughts...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
            <div className="bg-surface-highlight w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
              <Filter size={24} />
            </div>
            <p className="text-text-muted mb-2">No entries match your filters.</p>
            <button onClick={() => { setSearchQuery(""); setActiveFilter('all') }} className="text-primary font-bold hover:underline text-sm">Clear Filters</button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
            {filteredEntries.map(entry => {
              const MoodIcon = moodConfig[entry.mood]?.icon || Meh;
              const style = moodConfig[entry.mood] || moodConfig.neutral;

              if (viewMode === 'list') {
                // --- LIST VIEW (Compact) ---
                return (
                  <div key={entry.id} className="group bg-surface hover:bg-surface-highlight p-4 rounded-xl border border-border flex items-center justify-between transition-colors cursor-pointer">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${style.color} shrink-0`}>
                        <MoodIcon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-text-main text-sm font-medium truncate">{entry.content}</p>
                        <p className="text-text-muted text-xs flex items-center gap-2 mt-0.5">
                          <span>{format(new Date(entry.created_at), "MMM d, h:mm a")}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="uppercase tracking-wider text-[10px]">{style.label}</span>
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(entry.id)} className="p-2 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              }

              // --- GRID VIEW (Visual) ---
              return (
                <div key={entry.id} className="group bg-surface p-6 rounded-2xl border border-border shadow-card hover:border-primary/30 transition-all flex flex-col justify-between min-h-[200px]">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${style.color}`}>
                        <MoodIcon size={12} /> {style.label}
                      </div>
                      <button onClick={() => handleDelete(entry.id)} className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-text-main text-sm leading-relaxed whitespace-pre-wrap font-sans line-clamp-6">
                      {entry.content}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-text-muted text-xs font-mono">
                    <Calendar size={12} />
                    {format(new Date(entry.created_at), "MMMM d, yyyy • h:mm a")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NEW ENTRY MODAL (Unchanged Logic, cleaner UI) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-main">New Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-main"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-2 justify-center pb-4">
                {Object.keys(moodConfig).map((moodKey) => {
                  const Icon = moodConfig[moodKey].icon;
                  const isSelected = selectedMood === moodKey;
                  return (
                    <button
                      key={moodKey}
                      onClick={() => setSelectedMood(moodKey)}
                      className={`p-3 rounded-xl transition-all ${isSelected ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-background text-text-muted hover:bg-surface-highlight'}`}
                      title={moodKey}
                    >
                      <Icon size={20} />
                    </button>
                  );
                })}
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="How was your day? What's on your mind?"
                className="w-full h-40 bg-background rounded-xl p-4 text-text-main border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-text-muted text-sm leading-relaxed"
                autoFocus
              />
            </div>

            <div className="p-6 bg-surface-highlight border-t border-border flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-text-muted font-bold hover:bg-border rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20">Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diary;
