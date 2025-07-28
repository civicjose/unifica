import React from 'react';
import Select, { components } from 'react-select';
import { FiChevronDown } from 'react-icons/fi';

// El ValueContainer que ya funciona bien
const ValueContainer = (props) => {
  const { placeholder } = props.selectProps;
  const selectedCount = props.getValue().length;
  return (
    <components.ValueContainer {...props}>
      {!selectedCount && placeholder}
      {selectedCount === 1 && props.children[0]}
      {selectedCount > 1 && `${selectedCount} seleccionados`}
      {React.Children.map(props.children, child =>
        child && child.type.name === 'Input' ? child : null
      )}
    </components.ValueContainer>
  );
};

// Componente para el icono de flecha
const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <FiChevronDown className="text-gray-400" />
  </components.DropdownIndicator>
);

function MultiSelectFilter({ options, placeholder, onChange }) {
  // Objeto de estilos completo para un look profesional
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: '0.75rem', // 12px
      borderColor: state.isFocused ? '#e5007e' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(229, 0, 126, 0.2)' : 'none',
      minHeight: '42px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      '&:hover': {
        borderColor: '#e5007e',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 1rem',
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e5007e' : state.isFocused ? 'rgba(229, 0, 126, 0.1)' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      padding: '10px 16px',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
  };

  return (
    <Select
      isMulti
      options={options}
      className="w-full text-sm sm:w-64"
      styles={customStyles}
      placeholder={placeholder}
      onChange={onChange}
      components={{ ValueContainer, DropdownIndicator, IndicatorSeparator: () => null }}
      hideSelectedOptions={false}
      isMultiValue={false}
    />
  );
}

export default MultiSelectFilter;