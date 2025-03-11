const TASKS_KEY = 'effisense_tasks';

export const getTasks = () => {
  try {
    const tasks = localStorage.getItem(TASKS_KEY);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const addTask = (task) => {
  try {
    const tasks = getTasks();
    const newTask = {
      ...task,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    const updatedTasks = [...tasks, newTask];
    localStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    return updatedTasks;
  } catch (error) {
    console.error('Error adding task:', error);
    return getTasks();
  }
};

export const updateTask = (taskId, updatedFields) => {
  try {
    const tasks = getTasks();
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updatedFields } : task
    );
    localStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    return updatedTasks;
  } catch (error) {
    console.error('Error updating task:', error);
    return getTasks();
  }
};

export const deleteTask = (taskId) => {
  try {
    const tasks = getTasks();
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    return updatedTasks;
  } catch (error) {
    console.error('Error deleting task:', error);
    return getTasks();
  }
};
