import React, { useState } from 'react';
import MyTree from './Tree';
import DataTable from './DataTable';
import DraggablePanel from './DraggablePanel';



function transformData(data) {
  if (!data || data.length === 0) {
    return null;
  }

  const dataMap = data.reduce((map, node) => {
    map[node.id] = { ...node, children: [] };
    return map;
  }, {});

  const alltargetids = new Set();
  const missingEdges = [];
  data.forEach(node => {
    if (node.edges) {
      node.edges.forEach(edge => {
        alltargetids.add(edge.targetid);
        if (dataMap[edge.targetid]) {
          dataMap[node.id].children.push(dataMap[edge.targetid]);
        } else {
          // Add a special node for missing edge
          const missingNode = {
            id: `missing-${edge.targetid}`,
            name: `Missing: ${edge.targetid}`,
            isMissing: true,
            children: []
          };
          dataMap[node.id].children.push(missingNode);
          missingEdges.push({ from: node.id, to: edge.targetid });
        }
      });
    }
  });

  const rootNodes = data
    .filter(node => !alltargetids.has(node.id))
    .map(node => dataMap[node.id]);

  if (rootNodes.length === 0) {
    return null;
  }
  // If only one root node, return it directly. If multiple, return as array.
  return rootNodes.length === 1 ? rootNodes[0] : rootNodes;
}

function App() {
  // State to control visibility of upload/paste section
  const [showInputPanel, setShowInputPanel] = useState(true);
  // State for pasted array
  const [pastedText, setPastedText] = useState('');
  const [pasteError, setPasteError] = useState('');

  // Handle rendering pasted array
  const handlePasteRender = () => {
    setPasteError('');
    let arr;
    try {
      arr = JSON.parse(pastedText);
    } catch (e) {
      setPasteError('Invalid JSON.');
      return;
    }
    if (!Array.isArray(arr)) {
      setPasteError('Input must be a JSON array.');
      return;
    }
    if (arr.length === 0) {
      setPasteError('Array is empty.');
      return;
    }
    const treeData = transformData(arr);
    setHierarchicalData(treeData);
    setAttributeKeys(extractStringKeys(treeData));
    setFileNames([]);
    setUploadError('');
    setSelectedArray(null);
    setSelectedArrayName('');
    setSelectedNodeName('');
    setVisibleNodeProperties({});
    setShowInputPanel(false);
  };
  const [hierarchicalData, setHierarchicalData] = useState(null);
  const [selectedArray, setSelectedArray] = useState(null);
  const [selectedArrayName, setSelectedArrayName] = useState('');
  const [selectedNodeName, setSelectedNodeName] = useState('');
  const [visibleNodeProperties, setVisibleNodeProperties] = useState({});
  const [attributeKeys, setAttributeKeys] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileNames, setFileNames] = useState([]);


  // No static file fallback. Only render after upload.

  // Helper to extract all top-level string keys from hierarchical data
  const extractStringKeys = (data) => {
    const keys = new Set();
    // Accepts either a single root node or an array of root nodes
    const nodes = Array.isArray(data) ? data : [data];
    nodes.forEach(node => {
      if (node && typeof node === 'object') {
        Object.entries(node).forEach(([k, v]) => {
          if (typeof v === 'string') keys.add(k);
        });
      }
    });
    return Array.from(keys);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    setUploading(true);
    setUploadError('');
    setFileNames([]);
    const files = Array.from(event.target.files);
    if (!files.length) {
      setUploadError('No files selected.');
      setUploading(false);
      return;
    }
    let allData = [];
    let error = '';
    let loadedNames = [];
    for (const file of files) {
      loadedNames.push(file.name);
      try {
        const text = await file.text();
        if (!text.trim()) {
          error += `File '${file.name}' is empty. `;
          continue;
        }
        let json = JSON.parse(text);
        if (!Array.isArray(json)) {
          error += `File '${file.name}' does not contain a JSON array. `;
          continue;
        }
        allData = allData.concat(json);
      } catch (e) {
        error += `File '${file.name}' is not valid JSON. `;
      }
    }
    if (allData.length === 0) {
      setUploadError(error || 'No valid data found in uploaded files.');
      setUploading(false);
      setHierarchicalData(null);
      setFileNames(loadedNames);
      return;
    }
    setFileNames(loadedNames);
    setUploadError(error);
    const treeData = transformData(allData);
    setHierarchicalData(treeData);
    // Dynamically set attribute filter keys
    setAttributeKeys(extractStringKeys(treeData));
    setUploading(false);
    setShowInputPanel(false);
  };

  const handleArraySelection = (arrayData, name, nodeName) => {
    setSelectedArray(arrayData);
    setSelectedArrayName(name);
    setSelectedNodeName(nodeName);
  };

  const clearSelectedArray = () => {
    setSelectedArray(null);
    setSelectedArrayName('');
    setSelectedNodeName('');
  };

  // Reset all app state
  const handleReset = () => {
    setHierarchicalData(null);
    setSelectedArray(null);
    setSelectedArrayName('');
    setSelectedNodeName('');
    setVisibleNodeProperties({});
    setAttributeKeys([]);
    setUploadError('');
    setUploading(false);
    setFileNames([]);
    // Optionally clear file input value
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowInputPanel(true);
  };

  // Ref for file input to clear it on reset
  const fileInputRef = React.useRef();

  return (
    <div className="App">
      {/* Upload and paste panels, hidden after render */}
      {showInputPanel && (
        <>
          <DraggablePanel
            title="Input Panel"
            defaultX={window.innerWidth / 2 - 220}
            defaultY={10}
            minWidth={440}
            zIndex={2000}
            onHeaderAction={() => setShowInputPanel(false)}
            headerActionLabel="Hide"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontWeight: 'bold', marginRight: 10, display: 'block', marginBottom: 8 }}>Upload JSON files:</label>
                <input ref={fileInputRef} type="file" accept=".json" multiple onChange={handleFileUpload} style={{ marginRight: 10 }} />
                {uploading && <span style={{ color: '#888', marginLeft: 10 }}>Uploading...</span>}
                <div style={{ minWidth: 120 }}>
                  {fileNames.length > 0 && (
                    <div style={{ fontSize: 12, marginTop: 4, color: '#555' }}>Loaded: {fileNames.join(', ')}</div>
                  )}
                  {uploadError && <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{uploadError}</div>}
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', marginBottom: 6, display: 'block' }}>Or paste JSON array:</label>
                <textarea
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  rows={5}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: 14, marginBottom: 8, resize: 'vertical', borderRadius: 4, border: '1px solid #bbb', padding: 6, boxSizing: 'border-box' }}
                  placeholder='Paste a JSON array here, e.g. [{"id":1,"name":"A"}, ...]'
                />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    onClick={handlePasteRender}
                    style={{ padding: '6px 18px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: 14 }}
                  >
                    Render
                  </button>
                  {pasteError && <span style={{ color: 'red', fontSize: 13 }}>{pasteError}</span>}
                </div>
              </div>
            </div>
          </DraggablePanel>
        </>
      )}
      {/* Show button to unhide input panel if hidden and data is rendered */}
      {!showInputPanel && hierarchicalData && (
        <button
          onClick={() => setShowInputPanel(true)}
          style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 2100, background: 'white', color: '#1976d2', border: '2px solid #1976d2', borderRadius: 6, fontWeight: 'bold', fontSize: 14, padding: '6px 18px', cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}
        >
          Show Input Panel
        </button>
      )}
      {/* Reset button at top right, outline style, only when data is rendered */}
      {hierarchicalData && (
        <button
          onClick={handleReset}
          style={{
            position: 'absolute',
            top: 16,
            right: 24,
            fontWeight: 'bold',
            fontSize: 14,
            padding: '6px 18px',
            background: 'white',
            color: '#f44336',
            border: '2px solid #f44336',
            borderRadius: 6,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0002',
            zIndex: 2100
          }}
          title="Reset all data and UI"
        >
          Reset
        </button>
      )}
      {hierarchicalData && selectedArray && (
        <DraggablePanel
          title={`${selectedNodeName} - ${selectedArrayName}`}
          defaultX={window.innerWidth - 370}
          defaultY={70}
          minWidth={350}
          zIndex={1000}
        >
          <div>
            <button
              onClick={clearSelectedArray}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'transparent',
                border: 'none',
                fontSize: 20,
                fontWeight: 'bold',
                cursor: 'pointer',
                color: '#888',
                zIndex: 1100,
                padding: '4px 8px',
                lineHeight: 1
              }}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
            <DataTable data={selectedArray} />
          </div>
        </DraggablePanel>
      )}
      {hierarchicalData && (
        <DraggablePanel
          title="Attribute Filter"
          defaultX={10}
          defaultY={10}
          minWidth={300}
          zIndex={1000}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attributeKeys.map(prop => (
              <label key={prop} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={visibleNodeProperties[prop] === true}
                  onChange={() => setVisibleNodeProperties(prev => ({
                    ...prev,
                    [prop]: !prev[prop]
                  }))}
                />
                {prop}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              style={{ padding: '6px 16px', background: '#eee', border: '1px solid #bbb', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
              onClick={() => setVisibleNodeProperties({})}
            >
              Clear
            </button>
            <button
              style={{ padding: '6px 16px', background: '#eee', border: '1px solid #bbb', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
              onClick={() => setVisibleNodeProperties(Object.fromEntries(attributeKeys.map(k => [k, true])))}
            >
              Select All
            </button>
          </div>
        </DraggablePanel>
      )}
      {hierarchicalData ? <MyTree data={hierarchicalData} onArraySelect={handleArraySelection} visibleNodeProperties={visibleNodeProperties} /> : null}
    </div>
  );
}

export default App;
