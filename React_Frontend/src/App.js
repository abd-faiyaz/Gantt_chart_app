import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

import TaskForm from './modules/TaskForm';
import EpicForm from './modules/EpicForm';
import SubTaskForm from './modules/SubTaskForm';
import TaskView from './modules/TaskView';
import HomePage from "./modules/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-task" element={<TaskForm />} />
        <Route path="/add-task/:epicId" element={<TaskForm />} />
        <Route path="/add-epic" element={<EpicForm />} />
        <Route path="/add-subtask/:taskId" element={<SubTaskForm />} />
        <Route path="/edit-task" element={<TaskForm />} />
        <Route path="/edit-epic" element={<EpicForm />} />
        <Route path="/edit-subtask" element={<SubTaskForm />} />
        <Route path="/view-tasks" element={<TaskView />} />
      </Routes>
    </Router>
  );
}

export default App;
