/**
 * Retrieves the next available object from a specific pool using a Round-Robin search.
 * 
 * @function get_from_pool
 * @param {string} pool_key - The key identifying the pool in pool_state (e.g., 'enemy_pool').
 * @returns {Object|null} The entity data object if one is available; otherwise, null.
 * 
 * @description
 * 1. Locates the pool and its corresponding tracking index.
 * 2. Iterates through the pool starting from the last used position.
 * 3. If an inactive object is found, marks it as active, updates the index, and returns it.
 */                                                    
function get_from_pool(pool_key) {
    if (!pool_state.pools[pool_key]) {
        console.error(`Error: Pool key "${pool_key}" does not exist in pool_state.`);
        return null;
    }
    const pool = pool_state.pools[pool_key];
    const indices = pool_state.indices;

    for (let i = 0; i < pool.length; i++) {
        const index = (indices[pool_key] + i) % pool.length;
        
        if (!pool[index].is_active) {
            pool[index].is_active = true;
            indices[pool_key] = (index + 1) % pool.length; 
            return pool[index];
        }
    }   
    console.warn(`${pool_key} exhausted!`);
    return null;
}
