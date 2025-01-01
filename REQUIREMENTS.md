# Flow - Visual Recipe Flow Editor

## Project Overview
Flow is a visual editor for creating and managing production chains/recipes, similar to factory planning tools. It allows users to create, connect, and manage nodes representing recipes and resource flows in a visual graph-based interface.

## Core Features

### Node Types
1. **Recipe Nodes**
   - Represent production recipes with inputs and outputs
   - Display recipe name and associated items
   - Support multiple inputs and outputs
   - Visual representation of input/output handles

2. **Dynamic Nodes**
   - **Splerger Nodes**: Combined splitter/merger functionality
     - Can split one input into multiple outputs
     - Can merge multiple inputs into one output
     - Automatically types based on connections
   - **Sink Nodes**: Endpoints for resource flows
     - Can accept inputs of any type
     - Type locks to first connection

### Connection System
1. **Validation Rules**
   - Connections must match item types between nodes
   - Dynamic nodes adapt their type to first connection
   - Prevents invalid connections between incompatible types
   - Supports wildcard connections for untyped dynamic nodes

2. **Visual Feedback**
   - Highlights valid connection points while dragging
   - Shows connection state and validity
   - Provides visual feedback for connection attempts

### User Interface
1. **Main Editor**
   - Full-screen flow editor
   - Drag and drop interface
   - Pan and zoom controls
   - Grid snapping
   - Background grid

2. **Toolbar**
   - Quick access to node creation
   - Tool selection
   - Editor controls

3. **Context Menu**
   - Right-click menu for nodes and canvas
   - Node/edge deletion
   - Node-specific actions

### Data Management
1. **State Management**
   - Centralized store for application state
   - Manages nodes and edges
   - Handles undo/redo operations
   - Persists editor state

2. **Game Metadata**
   - Recipe definitions
   - Item definitions
   - Machine definitions
   - Import/export functionality

## Technical Requirements

### React Components
1. **Flow Editor**
   - Uses React Flow library
   - Manages node and edge state
   - Handles user interactions
   - Implements connection logic

2. **Node Components**
   - Custom node implementations
   - Handle rendering and interactions
   - Support for different node types
   - Dynamic state updates

### Type System
1. **Core Types**
   - `FlowNode`: Base node type
   - `FlowEdge`: Connection type
   - `Recipe`: Recipe definition
   - `Item`: Item definition
   - `Machine`: Machine definition

2. **Type Safety**
   - TypeScript throughout
   - Type guards for node types
   - Validation helpers
   - Connection type checking

### Testing
1. **Unit Tests**
   - Component testing
   - Node validation
   - Connection logic
   - State management

2. **Integration Tests**
   - Flow editor functionality
   - Node interactions
   - Connection handling
   - User interactions

## Implementation Details

### Connection Validation
1. **Handle Types**
   - Source (output) handles
   - Target (input) handles
   - Type-specific validation

2. **Validation Logic**
   ```typescript
   - Check node types (Recipe vs Dynamic)
   - Validate item type compatibility
   - Handle wildcard connections
   - Update dynamic node types
   ```

### State Updates
1. **Node Changes**
   - Position updates
   - Data modifications
   - Type changes
   - Connection state

2. **Edge Changes**
   - Connection creation/deletion
   - Validation updates
   - Dynamic node type updates

### Performance Considerations
1. **Rendering Optimization**
   - Memoization of expensive calculations
   - Efficient state updates
   - Batched DOM updates

2. **State Management**
   - Minimized re-renders
   - Efficient data structures
   - Cached computations

## Future Enhancements
1. **Features**
   - Advanced routing algorithms
   - Auto-layout capabilities
   - Template support
   - Multi-select operations

2. **Optimization**
   - Performance improvements for large graphs
   - Memory usage optimization
   - Rendering optimizations

3. **User Experience**
   - Improved visual feedback
   - Better error handling
   - Enhanced tooltips and help
   - Keyboard shortcuts 