import React from "react";
import TaskCard from "./TaskCard";

const TaskList = ({ tasks, onEdit, onDelete }) => {
  return (
    <div className="mt-4 space-y-4">
      {tasks.length === 0 ? (
        <p className="text-gray-600">No tasks added yet.</p>
      ) : (
        tasks.map((task, index) => (
          <TaskCard
            key={index}
            task={task}
            onEdit={() => onEdit(index)}
            onDelete={() => onDelete(index)}
          />
        ))
      )}
    </div>
  );
};

export default TaskList;