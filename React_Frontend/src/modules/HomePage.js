import { useNavigate } from "react-router-dom";

const HomePage=()=>{

    const navigate = useNavigate();
    const handleCreateTask = () => {
        navigate("/add-task");
    };
    const handleCreateEpic = () => {
        navigate("/add-epic");
    };
    const handleViewTasks = () => {
        navigate("/view-tasks");
    };
    return(
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>This is the main page of our application.</p>
            <button className="button" onClick={handleCreateTask}>Create Task</button><br /><br/>
            <button className="button" onClick={handleCreateEpic}>Create Epic</button><br /><br/>
            <button className="button" onClick={handleViewTasks}>View Tasks</button>
        </div>
    );
};

export default HomePage;