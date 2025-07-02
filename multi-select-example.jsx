import React, { useState, useRef, useEffect } from 'react';

// Main App component
export default function App() {
  // Placeholder data for assignees
  const allAssignees = [
    { id: '1', name: 'Rachel Moore', email: 'rachel_moore' },
    { id: '2', name: 'John Doe', email: 'john_doe' },
    { id: '3', name: 'Jane Smith', email: 'jane_smith' },
    { id: '4', name: 'Michael Brown', email: 'michael_brown' },
    { id: '5', name: 'Emily White', email: 'emily_white' },
    { id: '6', name: 'David Green', email: 'david_green' },
    { id: '7', name: 'Sarah Black', email: 'sarah_black' },
  ];

  // State to hold the currently selected assignees
  const [selectedAssignees, setSelectedAssignees] = useState([]);

  // Function to handle changes in selected assignees
  const handleAssigneeChange = (newSelection) => {
    setSelectedAssignees(newSelection);
    console.log("Selected Assignees:", newSelection); // Log selected assignees for demonstration
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Assign Epic</h1>

        {/* MultiSelect component for assignees */}
        <MultiSelectAssignee
          label="Assignees"
          options={allAssignees}
          selectedOptions={selectedAssignees}
          onChange={handleAssigneeChange}
          placeholder="Select assignees..."
        />

        <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-200 text-sm text-blue-800">
          <h2 className="font-semibold mb-2">Current Selections:</h2>
          {selectedAssignees.length > 0 ? (
            <ul className="list-disc list-inside">
              {selectedAssignees.map(assignee => (
                <li key={assignee.id}>{assignee.name} ({assignee.email})</li>
              ))}
            </ul>
          ) : (
            <p>No assignees selected yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// MultiSelectAssignee Component
const MultiSelectAssignee = ({ label, options, selectedOptions, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false); // State to control dropdown visibility
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const inputRef = useRef(null); // Ref for the input element
  const dropdownRef = useRef(null); // Ref for the dropdown container

  // Filter options based on search term and exclude already selected options
  const filteredOptions = options.filter(
    (option) =>
      !selectedOptions.some((selected) => selected.id === option.id) &&
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle adding an assignee
  const handleAddAssignee = (assignee) => {
    onChange([...selectedOptions, assignee]); // Add to selected options
    setSearchTerm(''); // Clear search term
    setIsOpen(false); // Close dropdown
    inputRef.current?.focus(); // Focus back on input
  };

  // Handle removing an assignee
  const handleRemoveAssignee = (assigneeId) => {
    onChange(selectedOptions.filter((assignee) => assignee.id !== assigneeId)); // Filter out the removed assignee
    inputRef.current?.focus(); // Focus back on input
  };

  // Handle input change for search
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true); // Open dropdown when typing
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      <label htmlFor="assignees" className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div
        className="flex flex-wrap items-center w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 min-h-[42px]"
        onClick={() => inputRef.current?.focus()} // Focus input when clicking the container
      >
        {/* Display selected assignees as tags */}
        {selectedOptions.map((assignee) => (
          <span
            key={assignee.id}
            className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-2 mb-1 sm:mb-0"
          >
            {assignee.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropdown from opening/closing when removing tag
                handleRemoveAssignee(assignee.id);
              }}
              className="ml-1.5 text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
              aria-label={`Remove ${assignee.name}`}
            >
              &times;
            </button>
          </span>
        ))}

        {/* Input for searching/adding assignees */}
        <input
          id="assignees"
          ref={inputRef}
          type="text"
          className="flex-grow outline-none bg-transparent text-gray-900 placeholder-gray-400 py-1"
          placeholder={selectedOptions.length === 0 ? placeholder : ''}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)} // Open dropdown on focus
        />

        {/* Dropdown arrow icon */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>

      {/* Dropdown list of filtered options */}
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
          {filteredOptions.map((option) => (
            <li
              key={option.id}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-gray-800 transition-colors duration-150"
              onClick={() => handleAddAssignee(option)}
            >
              {option.name} ({option.email})
            </li>
          ))}
        </ul>
      )}

      {/* Message if no options available after filtering */}
      {isOpen && filteredOptions.length === 0 && searchTerm !== '' && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 px-4 py-2 text-gray-500">
          No matching assignees found.
        </div>
      )}
    </div>
  );
};