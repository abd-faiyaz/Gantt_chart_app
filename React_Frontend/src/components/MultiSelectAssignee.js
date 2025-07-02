import React from 'react';
import Select from 'react-select';

const MultiSelectAssignee = ({ 
    label = "Assignees", 
    value = [], 
    onChange, 
    users = [],
    className = "",
    error = null,
    isRequired = false,
    isMulti = true,
    placeholder = "Select assignees..."
}) => {
    // Convert users to option objects for react-select
    const userOptions = users.map(user => ({
        value: user.id,
        label: `${user.fullName} (${user.username})`,
        user: user
    }));

    // Convert value(s) to the format expected by react-select
    const formatValueForSelect = (val) => {
        if (!val) return isMulti ? [] : null;
        
        if (isMulti) {
            const valueArray = Array.isArray(val) ? val : [val];
            return valueArray
                .map(id => userOptions.find(option => option.value === id))
                .filter(Boolean);
        } else {
            return userOptions.find(option => option.value === val) || null;
        }
    };

    // Convert selected options back to format for form
    const formatValueForForm = (selectedOptions) => {
        if (!selectedOptions) return isMulti ? [] : null;
        
        if (isMulti) {
            return selectedOptions.map(option => option.value);
        } else {
            return selectedOptions.value;
        }
    };

    const handleChange = (selectedOptions) => {
        const formValue = formatValueForForm(selectedOptions);
        onChange(formValue);
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '48px',
            border: `1px solid ${state.isFocused ? '#1976d2' : '#ddd'}`,
            borderRadius: '4px',
            boxShadow: state.isFocused ? '0 0 0 1px #1976d2' : 'none',
            '&:hover': {
                border: `1px solid ${state.isFocused ? '#1976d2' : '#999'}`
            }
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#e8f5e8',
            borderRadius: '16px'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#2e7d32',
            fontSize: '14px',
            fontWeight: '500'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#2e7d32',
            ':hover': {
                backgroundColor: '#c8e6c9',
                color: '#1b5e20'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected 
                ? '#1976d2' 
                : state.isFocused 
                    ? '#f0f8ff' 
                    : 'white',
            color: state.isSelected ? 'white' : '#333',
            ':hover': {
                backgroundColor: state.isSelected ? '#1976d2' : '#f0f8ff'
            }
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#999',
            fontSize: '14px'
        })
    };

    return (
        <div className={className}>
            {label && (
                <div className="title">
                    <label className="block text-sm font-medium text-gray-700">
                        {label} {isRequired && <span className="text-red-500">*</span>}
                    </label>
                </div>
            )}
            <Select
                isMulti={isMulti}
                value={formatValueForSelect(value)}
                onChange={handleChange}
                options={userOptions}
                placeholder={placeholder}
                styles={customStyles}
                isClearable={true}
                isSearchable={true}
                noOptionsMessage={() => "No users available"}
                menuPortalTarget={document.body}
                menuPosition="fixed"
            />
            {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
        </div>
    );
};

export default MultiSelectAssignee;
