// Migration script to update edge handle IDs
function migrateData() {
  try {
    // Load flow graph
    const graph = localStorage.getItem('flowGraphState');
    if (graph) {
      const flowGraph = JSON.parse(graph);
      
      // Update edge handle IDs
      flowGraph.edges = flowGraph.edges.map(edge => ({
        ...edge,
        sourceHandle: edge.sourceHandle?.replace('source-', 'output-'),
        targetHandle: edge.targetHandle?.replace('target-', 'input-'),
      }));

      // Save updated graph
      localStorage.setItem('flowGraphState', JSON.stringify(flowGraph));
      console.log('Successfully migrated flow graph edges');
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateData(); 