import TaskItem from "./TaskItem.jsx";

export default function TaskList({ tasks, onUpdate, onDelete, onError }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onError={onError}
        />
      ))}
    </div>
  );
}
