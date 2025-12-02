# Hierarchy Visualizer

A React-based interactive tool for visualizing hierarchical data structures as trees. Upload JSON files or paste JSON arrays directly to create dynamic, navigable visualizations with detailed node properties and attribute filtering.

## Features

- **Multiple Input Methods**: Upload JSON files or paste JSON arrays directly
- **Interactive Tree Visualization**: Explore hierarchical data with an intuitive tree view
- **Draggable Panels**: Reposition and resize information panels as needed
- **Attribute Filtering**: Show/hide specific node properties dynamically
- **Data Table View**: Click nodes to view detailed information in a separate panel
- **Missing Edge Detection**: Identifies and highlights references to missing nodes
- **Reset Functionality**: Clear all data and start fresh at any time

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone or download the repository
2. Navigate to the project directory:
   ```bash
   cd hierarchy-visualizer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The page will automatically reload when you make changes.

## How to Use

### 1. Prepare Your Data

Your data must be a **JSON array** where each object has at minimum:
- `id`: A unique identifier for the node
- `name`: Display name for the node
- `edges`: An array of edge objects (can be empty)

Example JSON structure:
```json
[
  {
    "id": "1",
    "name": "Root Node",
    "edges": [
      { "targetid": "2" },
      { "targetid": "3" }
    ]
  },
  {
    "id": "2",
    "name": "Child Node 1",
    "edges": []
  },
  {
    "id": "3",
    "name": "Child Node 2",
    "edges": [
      { "targetid": "4" }
    ],
    "properties": [
      { "name": "type", "value": "category" },
      { "name": "priority", "value": "high" }
    ]
  },
  {
    "id": "4",
    "name": "Leaf Node",
    "edges": []
  }
]
```

### 2. Load Your Data

#### Option A: Upload JSON Files

1. Click the **Input Panel** at the top center
2. Click the file input and select one or more `.json` files
3. The application will process all files and combine their data
4. The tree visualization will appear below

#### Option B: Paste JSON Array

1. Click the **Input Panel** at the top center
2. In the "Or paste JSON array" section, paste your JSON array
3. Click the **Render** button
4. The tree visualization will appear below

### 3. Explore the Visualization

- **Tree View**: The main canvas displays your hierarchical data as an interactive tree
- **Expand/Collapse Nodes**: Click on nodes to expand or collapse their children
- **View Node Details**: Click a node to see its full properties in the data table panel (right side)

### 4. Filter Attributes

The **Attribute Filter** panel (left side) allows you to control which properties are displayed on nodes:

- **Select All**: Show all available attributes
- **Clear**: Hide all attributes
- Individual checkboxes to toggle specific attributes on/off

### 5. Manage Panels

All information panels are draggable:

- Click and drag the panel header to move it around the screen
- Click the **Hide** button in the panel title to hide panels
- Click **Show Input Panel** (top center) to reveal the input panel again
- Click **Reset** (top right) to clear all data and start over

### 6. Reset

Click the **Reset** button (red outline, top right) to:
- Clear all loaded data
- Reset the visualization
- Return the interface to its initial state
- Show the Input Panel again

## Data Format Details

### Required Fields

- `id` (string): Unique identifier for the node
- `name` (string): Display name for the node
- `edges` (array): Array of edge objects pointing to child nodes

### Optional Fields

- `properties` (array): Custom properties to display. Each property should have:
  - `name` (string): Property name
  - `value` (string or any): Property value

### Edge Objects

Each edge should have:
- `targetid` (string): The ID of the target node

**Note**: If a `targetid` references a node that doesn't exist in your data, it will be marked as "Missing" in the visualization.

## Keyboard Shortcuts & Mouse Events

- **Drag Panels**: Click and hold the panel title bar, then drag
- **Click Nodes**: Select a node to view details
- **Scroll**: Use mouse wheel to zoom in/out on the tree (if supported)

## Build for Production

To create an optimized production build:

```bash
npm run build
```

The build folder will be created with optimized files ready for deployment.

## Troubleshooting

### "Input must be a JSON array" error
- Ensure your pasted content is a valid JSON array `[...]`
- Check for syntax errors in your JSON

### "File does not contain a JSON array" error
- Verify each uploaded file contains a valid JSON array, not an object

### Tree not displaying
- Ensure your data has proper hierarchical structure with edges
- Check that all referenced node IDs exist in your dataset
- Look for missing edge warnings in the console

### Panels overlapping
- Drag panels to reposition them as needed
- Use the Hide button to temporarily hide panels

## Component Overview

- **App.js**: Main application component managing state and data flow
- **Tree.js**: Tree visualization component
- **DataTable.js**: Displays detailed node information
- **DraggablePanel.js**: Reusable draggable panel wrapper component

## Technologies Used

- React
- CSS3 (Flexbox, Grid, Animations)
- JavaScript ES6+

## Notes

- The application stores data in browser memory. Refreshing the page will clear loaded data.
- Large datasets may impact performance; consider splitting into multiple files.
- The visualization automatically detects root nodes (nodes with no incoming edges).

