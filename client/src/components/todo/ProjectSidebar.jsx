import React from 'react';
import {
    Folder, Plus, MoreVertical, Trash2, Tag
} from 'lucide-react';

const ProjectSidebar = ({
    projects,
    activeProject,
    onSelectProject,
    onAddProject,
    onDeleteProject
}) => {
    return (
        <aside className="w-64 bg-surface border-r border-border flex flex-col h-full bg-surface-highlight/30">

            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-center">
                <h2 className="font-bold text-text-main flex items-center gap-2">
                    <Folder size={20} className="text-primary" />
                    Projects
                </h2>
                <button
                    onClick={onAddProject}
                    className="p-1.5 hover:bg-surface-highlight rounded-lg text-text-muted hover:text-primary transition-colors"
                    title="New Project"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* Project List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">

                {/* 'All Tasks' Default View */}
                <button
                    onClick={() => onSelectProject(null)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${activeProject === null
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-muted hover:text-text-main hover:bg-surface-highlight'
                        }`}
                >
                    <div className="p-1.5 bg-background rounded-md shadow-sm">
                        <Tag size={14} />
                    </div>
                    All Tasks
                </button>

                <div className="my-2 h-px bg-border/50 mx-2" />

                {/* User Projects */}
                {projects.length === 0 && (
                    <div className="text-center py-4 px-2">
                        <p className="text-xs text-text-muted">No folders yet.</p>
                    </div>
                )}

                {projects.map(project => (
                    <div key={project.id} className="group relative">
                        <button
                            onClick={() => onSelectProject(project)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${activeProject?.id === project.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-muted hover:text-text-main hover:bg-surface-highlight'
                                }`}
                        >
                            {/* Icon / Color Dot */}
                            <div className={`w-2.5 h-2.5 rounded-full bg-${project.color || 'indigo'}-500 shadow-[0_0_8px_currentColor]`} />

                            <span className="truncate flex-1">{project.name}</span>
                        </button>

                        {/* Delete Action (Hover) */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default ProjectSidebar;
