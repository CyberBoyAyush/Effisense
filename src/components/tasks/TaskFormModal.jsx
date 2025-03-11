import React, { useState, useEffect } from "react";

const TaskFormModal = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setDeadline(taskToEdit.deadline);
    } else {
      setTitle("");
      setDescription("");
      setDeadline("");
    }
  }, [taskToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    
    const newTask = { title, description, deadline };
    onSave(newTask);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold">{taskToEdit ? "Edit Task" : "Add Task"}</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <input type="text" placeholder="Task Title" className="w-full p-2 border rounded mt-2"
            value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea placeholder="Description" className="w-full p-2 border rounded mt-2"
            value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="date" className="w-full p-2 border rounded mt-2"
            value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" className="px-4 py-2 bg-gray-500 text-white rounded" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{taskToEdit ? "Update" : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;