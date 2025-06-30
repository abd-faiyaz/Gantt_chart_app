import "./TaskList.css"
import { useNavigate } from "react-router-dom";
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TypeIcon from './TypeIcon';

// Helper function to convert originalEstimate to days display
const formatEstimateAsDays = (originalEstimate) => {
    if (!originalEstimate) return 'N/A';
    
    // If it's a string, check for different formats
    if (typeof originalEstimate === 'string') {
        // Handle P{days}D format
        if (originalEstimate.startsWith('P') && originalEstimate.endsWith('D')) {
            const days = originalEstimate.substring(1, originalEstimate.length - 1);
            return `${days} days`;
        }
        // Handle PT{hours}H format (convert to days)
        if (originalEstimate.startsWith('PT') && originalEstimate.endsWith('H')) {
            const hours = parseFloat(originalEstimate.substring(2, originalEstimate.length - 1));
            const days = (hours / 8).toFixed(1); // Convert hours to days (8 hours per day)
            return `${days} days`;
        }
        return originalEstimate;
    }
    
    // If it's an object with duration properties, try to extract days
    if (typeof originalEstimate === 'object') {
        // Handle Java Duration object structure
        if (originalEstimate.seconds !== undefined) {
            const hours = originalEstimate.seconds / 3600; // Convert seconds to hours
            const days = (hours / 8).toFixed(1); // Convert hours to days
            return `${days} days`;
        }
        return JSON.stringify(originalEstimate);
    }
    
    return originalEstimate.toString();
};

const TaskCard=({task, onDelete })=>{
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate("/edit-task", { state: { task } });
    };

    return(
        <tr>
            <td>{task.title}</td>
            <td>{task.description}</td>
            <td className="assignee-column">{task.assigneeName || task.assigneeId || 'Unassigned'}</td>
            <td><TypeIcon type={task.type} /></td>
            <td><StatusBadge status={task.status} /></td>
            <td><PriorityBadge priority={task.priority} /></td>
            <td>{formatEstimateAsDays(task.originalEstimate)}</td>
            <td className="date-column">{task.startDate}</td>
            <td className="date-column">{task.dueDate || 'N/A'}</td>
            <td>{Array.isArray(task.labels) ? task.labels.join(', ') : (task.labels || 'N/A')}</td>
            <td>
                <div className="button-container">
                    <button onClick={handleEdit} className="button-list">Edit</button>
                    <button onClick={onDelete} className="button-list">Delete</button>
                </div>
            </td>
        </tr>
    );
};

export default TaskCard;
