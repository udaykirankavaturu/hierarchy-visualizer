import React, { useState, useMemo, useEffect } from 'react';

const tableStyle = {
  borderCollapse: 'collapse',
  width: '100%',
  marginTop: '20px',
};

const thStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  backgroundColor: '#f2f2f2',
  textAlign: 'left',
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: '8px',
};

const filterContainerStyle = {
  marginBottom: '15px',
  padding: '10px',
  backgroundColor: '#f9f9f9',
  border: '1px solid #ddd',
  borderRadius: '4px',
};

const filterLabelStyle = {
  fontWeight: 'bold',
  marginBottom: '8px',
  display: 'block',
};

const checkboxContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
};

const checkboxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  cursor: 'pointer',
};

const DataTable = ({ data }) => {
  const [visibleColumns, setVisibleColumns] = useState({});
  const [search, setSearch] = useState("");

  // Extract string keys from data
  const stringKeys = useMemo(() => {
    if (!data) return [];

    if (Array.isArray(data)) {
      const keys = new Set();
      data.forEach(row => {
        Object.entries(row).forEach(([key, value]) => {
          if (typeof value === 'string') {
            keys.add(key);
          }
        });
      });
      return Array.from(keys);
    } else if (typeof data === 'object') {
      return Object.entries(data)
        .filter(([_, value]) => typeof value === 'string')
        .map(([key]) => key);
    }
    return [];
  }, [data]);

  // Initialize visible columns state
  useEffect(() => {
    if (Object.keys(visibleColumns).length === 0 && stringKeys.length > 0) {
      const initialState = {};
      stringKeys.forEach(key => {
        initialState[key] = true;
      });
      setVisibleColumns(initialState);
    }
  }, [stringKeys, visibleColumns]);

  const handleColumnToggle = (columnName) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnName]: !prev[columnName]
    }));
  };

  if (!data) {
    return null;
  }

  // Handle nested object case (when data is a single object like 'things')
  if (typeof data === 'object' && !Array.isArray(data)) {
    const objectEntries = Object.entries(data);

    // Filter by visible columns and search
    const filteredEntries = objectEntries.filter(([key, value]) => {
      if (typeof value === 'string') {
        if (visibleColumns[key] === false) return false;
        if (search && !(`${key} ${value}`.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
      }
      // For non-string values, filter by search on key or stringified value
      if (search) {
        const valueString = JSON.stringify(value, null, 2);
        if (!key.toLowerCase().includes(search.toLowerCase()) && !(valueString && valueString.toLowerCase().includes(search.toLowerCase()))) {
          return false;
        }
      }
      return true;
    });

    return (
      <>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '5px', fontSize: '14px', flex: 1 }}
          />
        </div>
        {stringKeys.length > 0 && (
          <div style={filterContainerStyle}>
            <label style={filterLabelStyle}>Columns Filter:</label>
            <div style={checkboxContainerStyle}>
              {stringKeys.map(key => (
                <label key={key} style={checkboxStyle}>
                  <input
                    type="checkbox"
                    checked={visibleColumns[key] !== false}
                    onChange={() => handleColumnToggle(key)}
                  />
                  {key}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                style={{ padding: '4px 12px', background: '#eee', border: '1px solid #bbb', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                onClick={() => setVisibleColumns({})}
              >
                Clear
              </button>
              <button
                style={{ padding: '4px 12px', background: '#eee', border: '1px solid #bbb', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                onClick={() => setVisibleColumns(Object.fromEntries(stringKeys.map(k => [k, true])))}
              >
                Select All
              </button>
            </div>
          </div>
        )}
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Key</th>
              <th style={thStyle}>Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map(([key, value]) => (
              <tr key={key}>
                <td style={tdStyle}>{key}</td>
                <td style={tdStyle}>
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  // Handle array case (existing functionality)
  if (!data || data.length === 0) {
    return null;
  }

  const headers = Object.keys(data[0]);

  const visibleHeaders = headers.filter(header => {
    const isStringColumn = stringKeys.includes(header);
    if (!isStringColumn) return true;
    return visibleColumns[header] !== false;
  });

  // Filter rows by search string
  const filteredRows = data.filter(row => {
    if (!search) return true;
    // Only check visible columns
    return visibleHeaders.some(header => {
      const value = row[header];
      return value && String(value).toLowerCase().includes(search.toLowerCase());
    });
  });

  return (
    <>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '5px', fontSize: '14px', flex: 1 }}
        />
      </div>
      {stringKeys.length > 0 && (
        <div style={filterContainerStyle}>
          <label style={filterLabelStyle}>Columns Filter:</label>
          <div style={checkboxContainerStyle}>
            {stringKeys.map(key => (
              <label key={key} style={checkboxStyle}>
                <input
                  type="checkbox"
                  checked={visibleColumns[key] !== false}
                  onChange={() => handleColumnToggle(key)}
                />
                {key}
              </label>
            ))}
          </div>
        </div>
      )}
      <table style={tableStyle}>
        <thead>
          <tr>
            {visibleHeaders.map(header => (
              <th key={header} style={thStyle}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row, index) => (
            <tr key={index}>
              {visibleHeaders.map(header => (
                <td key={header} style={tdStyle}>{String(row[header])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default DataTable;
