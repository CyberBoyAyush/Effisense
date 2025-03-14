import React from "react";
import TaskCard from "./TaskCard";
import { createPortal } from "react-dom";
import { taskCache } from "../../utils/database";

const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete }) => {
  const [openTaskDetails, setOpenTaskDetails] = React.useState(null);

  const handleDelete = async (taskId) => {
    if (onDelete) {
      onDelete(taskId);
    }
  };

  const handleToggleComplete = async (task) => {
    if (onToggleComplete) {
      // Get a consistent task object with proper IDs
      const taskToToggle = task.$id ? task : taskCache.getTask(task.id);
      if (taskToToggle) {
        onToggleComplete(taskToToggle);
      } else {
        // Fallback if task isn't in cache
        onToggleComplete(task);
      }
    }
  };

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-orange-800/30">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-xl font-semibold text-gray-300">No Tasks Yet</h3>
          <p className="text-gray-400 mt-2">Add your first task to get started</p>
        </div>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.$id}
            task={task}
            onEdit={() => onEdit(task)}
            onDelete={() => handleDelete(task.$id)}
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