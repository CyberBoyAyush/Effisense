import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { createPortal } from 'react-dom';

const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete }) => {
  const [openTaskDetails, setOpenTaskDetails] = useState(null);
  const [deletingTaskIds, setDeletingTaskIds] = useState([]); // Track tasks that are being deleted

  const handleDelete = async (task) => {
    try {
      const taskId = task.$id || task.id;
      
      // Add task ID to the deleting array to show loading state
      setDeletingTaskIds(prev => [...prev, taskId]);
      
      // Call the parent delete handler
      await onDelete(task);
      
      // After successful deletion, the task will be removed from the tasks array
      // But we'll also remove it from deletingTaskIds just to be safe
      setDeletingTaskIds(prev => prev.filter(id => id !== taskId));
    } catch (error) {
      // If deletion fails, remove from deleting state
      const taskId = task.$id || task.id;
      setDeletingTaskIds(prev => prev.filter(id => id !== taskId));
      console.error('Error deleting task:', error);
    }
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
            isDeleting={deletingTaskIds.includes(task.$id || task.id)} // Pass deleting state
          />
        ))
      )}

      {openTaskDetails && createPortal(openTaskDetails, document.body)}
    </div>
  );
};

export default TaskList;