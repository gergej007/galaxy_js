const SPATIAL_GRID = {
    cell_size: 100, 
    cells: {},
    
    // Convert coordinate to a string key e.g. "5,12"
    get_key(x, y) {
        return `${Math.floor(x / this.cell_size)},${Math.floor(y / this.cell_size)}`;
    },

    clear() { this.cells = {}; },

    // Insert an entity into all cells it overlaps
    insert(entity) {
        const rect = entity.rect;
        if (!rect || (rect.width === 0 && rect.height === 0)) return;
        
        for (let x = rect.left; x < rect.right + this.cell_size; x += this.cell_size) {
            for (let y = rect.top; y < rect.bottom + this.cell_size; y += this.cell_size) {
                const key = this.get_key(x, y);
                if (!this.cells[key]) this.cells[key] = [];
                this.cells[key].push(entity);
            }
        }
    },  
    
    get_entities_in_rect(rect) {
        const found_entities = new Set();
        // Loop through cells covered by the rect
        for (let x = rect.left; x < rect.right + this.cell_size; x += this.cell_size) {
            for (let y = rect.top; y < rect.bottom + this.cell_size; y += this.cell_size) {
                const key = this.get_key(x, y);
                const cell = this.cells[key];
                if (cell) {
                    cell.forEach(entity => found_entities.add(entity));
                }
            }
        }
        return found_entities;
    }
};

function rebuild_spatial_hash() {
    SPATIAL_GRID.clear();

    // 1. Array of all pools that need to be in the grid
    const entity_pools = [
        base_level_entities.bazis_shots,
        base_level_entities.homing_missiles,
        base_level_entities.tracking_lazers,
        base_level_entities.enemy_ships,
        base_level_entities.enemy_shots,
        boss_level_entities.boss_shots,       
    ];

    const solo_entities = [
        base_level_entities.bazis,
        base_level_entities.bounty,
        boss_level_entities.asteroid,
        boss_level_entities.boss
    ];

    // 2. Single pass to insert all active entities
    entity_pools.forEach(pool => {
        if (!pool) return;
        pool.forEach(entity => {
            if (entity.is_active && is_entity_valid(entity)) {
                SPATIAL_GRID.insert(entity);
            }
        });
    });
    solo_entities.forEach(entity => {
        if (is_entity_valid(entity) ) {           
            SPATIAL_GRID.insert(entity);           
        }
        });
}


// js
// /**
//  * Fast clear for the Spatial Grid. 
//  * Reuses the top-level objects to avoid memory allocations.
//  */
// function clear_spatial_grid() {
//     // Assuming SPATIAL_GRID.buckets is an object or Map
//     for (const key in SPATIAL_GRID.buckets) {
//         // Option A: Just empty the array (Preserves the array object)
//         SPATIAL_GRID.buckets[key].length = 0;
        
//         // Option B: If the bucket is empty for a while, delete it to save memory
//         // delete SPATIAL_GRID.buckets[key]; 
//     }
// }

// js
// function rebuild_spatial_hash() {
//     clear_spatial_grid();

//     // 1. Always track the player
//     SPATIAL_GRID.insert(base_level_entities.bazis);

//     // 2. Only insert enemies/shots if traffic is active
//     if (game_data.game_states.traffic_flag) {
//         insert_pool_to_grid(pool_state.pools.enemy_pool);
//         insert_pool_to_grid(pool_state.pools.enemy_shot_pool);
//     }

//     // 3. Only insert boss/asteroids if boss flag is active
//     if (game_data.game_states.boss_flag) {
//         SPATIAL_GRID.insert(boss_level_entities.boss);
//         SPATIAL_GRID.insert(boss_level_entities.asteroid);
//     }
// }