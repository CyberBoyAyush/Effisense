import React from 'react';
import TaskCard from './TaskCard';
import { createPortal } from 'react-dom';

const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete }) => {
  const [openTaskDetails, setOpenTaskDetails] = React.useState(null);

  const handleDelete = (task) => {
    onDelete(task);
  };

  // Update toggle handler to ensure status is properly passed
  const handleToggleComplete = async (task) => {
    if (onToggleComplete) {
      const isCurrentlyCompleted = task.status === 'completed';
      try {
        // Toggle task completion and update UI
        await onToggleComplete(task, !isCurrentlyCompleted);
        
        // Task status and completedAt will be updated by the parent component
        // after successful backend update
      } catch (error) {
        console.error('Error toggling task:', error);
      }
    }
  };

  // Sort tasks with completed at bottom using status field
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return 0;
  });

  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-orange-800/30">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-xl font-semibold text-gray-300">No Tasks Yet</h3>
          <p className="text-gray-400 mt-2">Add your first task to get started</p>
        </div>
      ) : (
        sortedTasks.map((task) => (
          <TaskCard
            key={task.$id || task.createdAt}
            task={task}
            onEdit={() => onEdit(task)}
            onDelete={() => handleDelete(task)}
            onToggleComplete={() => handleToggleComplete(task)}
            setOpenTaskDetails={setOpenTaskDetails}
            usePortal={true}
          />
        ))
      )}

      {openTaskDetails && createPortal(openTaskDetails, document.body)}
    </div>
  );
};

export default TaskList;