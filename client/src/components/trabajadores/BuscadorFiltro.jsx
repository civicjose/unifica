import React from "react";
import Select from "react-select";

function BuscadorFiltro({ options, placeholder, onChange }) {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: "9999px",
      borderColor: state.isFocused ? "#e5007e" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #e5007e" : "none",
      minHeight: "42px",
      maxHeight: "42px", // fija altura del select
      overflow: "hidden",
      "&:hover": {
        borderColor: "#e5007e",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      flexWrap: "nowrap", // evita que se apilen
      overflowX: "auto", // scroll horizontal si hay muchas
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      "&::-webkit-scrollbar": {
        display: "none", // oculta scrollbar
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      borderRadius: "9999px",
      backgroundColor: "#fce8f4",
      padding: "0 4px",
      display: "flex",
      alignItems: "center",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#e5007e", // texto de la etiqueta
      fontWeight: 500,
    }),
    multiValueRemove: (provided, state) => ({
      ...provided,
      color: "#e5007e", // color inicial de la X
      borderRadius: "50%",
      cursor: "pointer",
      padding: "2px",
      "&:hover": {
        backgroundColor: "#e5007e", // fondo al hover
        color: "white", // X blanca al hover
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.75rem",
      zIndex: 20,
      boxShadow:
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#e5007e"
        : state.isFocused
        ? "#fce8f4"
        : "white",
      color: state.isSelected ? "white" : "inherit",
      cursor: "pointer",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6b7280", // gris del placeholder
    }),
  };

  return (
    <Select
      isMulti
      isClearable
      isSearchable
      options={options}
      placeholder={placeholder}
      onChange={onChange}
      styles={customStyles}
      className="w-full text-sm sm:w-64"
      noOptionsMessage={() => "No hay opciones"}
      loadingMessage={() => "Cargando..."}
    />
  );
}

export default BuscadorFiltro;
