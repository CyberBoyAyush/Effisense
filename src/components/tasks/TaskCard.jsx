import React from "react";

const TaskCard = ({ task, onEdit, onDelete }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">{task.title}</h3>
        <p className="text-gray-600">{task.description}</p>
        <p className="text-sm text-gray-500">Deadline: {task.deadline}</p>
      </div>
      <div>
        <button
          className="px-3 py-1 bg-yellow-500 text-white rounded mr-2"
          onClick={onEdit}
        >
          Edit
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;