// Migration script to add quantities to recipe items
(() => {
  try {
    // Load existing metadata
    const metadataStr = localStorage.getItem('flowGameMetadata');
    if (metadataStr) {
      const metadata = JSON.parse(metadataStr);
      console.log('Old metadata loaded:', metadata);

      // Transform recipes to include quantities
      const newMetadata = {
        ...metadata,
        recipes: metadata.recipes.map(recipe => ({
          ...recipe,
          inputs: recipe.inputs.map(input => 
            typeof input === 'string' ? { name: input, quantity: 1 } : input
          ),
          outputs: recipe.outputs.map(output => 
            typeof output === 'string' ? { name: output, quantity: 1 } : output
          )
        }))
      };

      // Save transformed metadata
      localStorage.setItem('flowGameMetadata', JSON.stringify(newMetadata));
      console.log('Game metadata migrated:', newMetadata);

      // Load and transform flow graph
      const graphStr = localStorage.getItem('flowGraphState');
      if (graphStr) {
        const graph = JSON.parse(graphStr);
        console.log('Old graph loaded:', graph);

        // Transform nodes to use new recipe format
        const newGraph = {
          ...graph,
          nodes: graph.nodes.map(node => {
            if (node.type === 'recipe' && node.data.recipe) {
              return {
                ...node,
                data: {
                  ...node.data,
                  recipe: {
                    ...node.data.recipe,
                    inputs: node.data.recipe.inputs.map(input =>
                      typeof input === 'string' ? { name: input, quantity: 1 } : input
                    ),
                    outputs: node.data.recipe.outputs.map(output =>
                      typeof output === 'string' ? { name: output, quantity: 1 } : output
                    )
                  }
                }
              };
            }
            return node;
          })
        };

        // Save transformed graph
        localStorage.setItem('flowGraphState', JSON.stringify(newGraph));
        console.log('Flow graph migrated:', newGraph);
      }
    } else {
      console.log('No game metadata found');
    }

    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  }
})(); 