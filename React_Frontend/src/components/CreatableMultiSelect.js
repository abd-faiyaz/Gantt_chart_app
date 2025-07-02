import React from 'react';
import CreatableSelect from 'react-select/creatable';

const CreatableMultiSelect = ({ 
    label, 
    value = [], 
    onChange, 
    placeholder = "Select or create new...", 
    options = [],
    className = "",
    error = null,
    isRequired = false
}) => {
    // Convert string array to option objects for react-select
    const formatValueForSelect = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) {
            return val.map(item => ({
                value: typeof item === 'string' ? item : item.value,
                label: typeof item === 'string' ? item : item.label
            }));
        }
        return [];
    };

    // Convert option objects back to string array
    const formatValueForForm = (selectedOptions) => {
        if (!selectedOptions) return [];
        return selectedOptions.map(option => option.value);
    };

    const handleChange = (selectedOptions) => {
        const stringArray = formatValueForForm(selectedOptions);
        onChange(stringArray);
    };

    // Combine existing options with current values to create full options list
    const allOptions = React.useMemo(() => {
        const existingValues = Array.isArray(value) ? value : [];
        const optionValues = options.map(opt => opt.value || opt);
        const uniqueValues = [...new Set([...optionValues, ...existingValues])];
        
        return uniqueValues.map(val => ({
            value: val,
            label: val
        }));
    }, [options, value]);

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
            backgroundColor: '#e3f2fd',
            borderRadius: '16px'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#1976d2',
            fontSize: '14px',
            fontWeight: '500'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#1976d2',
            ':hover': {
                backgroundColor: '#bbdefb',
                color: '#0d47a1'
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
            <CreatableSelect
                isMulti
                value={formatValueForSelect(value)}
                onChange={handleChange}
                options={allOptions}
                placeholder={placeholder}
                styles={customStyles}
                isClearable={false}
                isSearchable={true}
                formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                noOptionsMessage={() => "No options"}
                createOptionPosition="first"
                menuPortalTarget={document.body}
                menuPosition="fixed"
            />
            {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
        </div>
    );
};

export default CreatableMultiSelect;
