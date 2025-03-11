import React from "react";

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete }) => {
  return (
    <div className={`p-3 sm:p-4 md:p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl 
      hover:border-blue-500/50 transition-all duration-300 group ${task.completed ? 'opacity-75' : ''}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-3 flex-1 w-full">
          <button
            onClick={onToggleComplete}
            className={`mt-1 flex-shrink-0 w-5 h-5 rounded border ${
              task.completed 
                ? 'bg-blue-500 border-blue-600' 
                : 'border-gray-600 hover:border-blue-500'
            } transition-colors`}
          >
            {task.completed && (
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div className="space-y-2 min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
              {task.title}
            </h3>
            <p className="text-gray-400 text-sm sm:text-base line-clamp-2">{task.description}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>📅</span>
              <span>Deadline: {task.deadline || 'No deadline set'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onEdit}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-sm bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 
              transition-all duration-200 border border-blue-500/20"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 
              transition-all duration-200 border border-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;