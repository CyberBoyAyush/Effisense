import React from "react";
import TaskCard from "./TaskCard";

const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete }) => {
  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-orange-800/30">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-xl font-semibold text-gray-300">No Tasks Yet</h3>
          <p className="text-gray-400 mt-2">Add your first task to get started</p>
        </div>
      ) : (
        tasks.map((task, index) => (
          <TaskCard
            key={task.id || index}
            task={task}
            onEdit={() => onEdit(index)}
            onDelete={() => onDelete(index)}
            onToggleComplete={() => onToggleComplete(index)}
          />
        ))
      )}
    </div>
  );
};

export default TaskList;