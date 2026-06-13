const SPATIAL_GRID = {
    cell_size: 100,
    cells: {}, // Stores string keys like "5,12" mapped to arrays

    /**
     * Reuses existing bucket arrays by clearing them, 
     * avoiding the creation of new object literals.
     */
    clear() {
        for (const key in this.cells) {
            this.cells[key].length = 0;
        }
    },

    /**
     * Converts a coordinate to a grid index.
     */
    get_key(col, row) {
        return `${col},${row}`;
    },

    /**
     * Inserts an entity into every cell its bounding box overlaps.
     */
    insert(entity,  override_rect = null) {                            // Coordinate mapping
        const rect = override_rect || entity.rect;
        if (!rect || rect.width === 0) return;

        // Calculate index ranges instead of pixel steps
        const start_col = Math.floor(rect.left / this.cell_size);
        const end_col = Math.floor(rect.right / this.cell_size);
        const start_row = Math.floor(rect.top / this.cell_size);
        const end_row = Math.floor(rect.bottom / this.cell_size);

        for (let col = start_col; col <= end_col; col++) {
            for (let row = start_row; row <= end_row; row++) {
                const key = this.get_key(col, row);
                if (!this.cells[key]) this.cells[key] = [];
                this.cells[key].push(entity);
            }
        }
    },

    /**
     * Retrieves all unique entities within the cells covered by the rect.
     * @returns {Set<Object>} A unique set of entities.
     */
    get_entities_in_rect(rect) {
        const found_entities = new Set();
        
        const start_col = Math.floor(rect.left / this.cell_size);
        const end_col = Math.floor(rect.right / this.cell_size);
        const start_row = Math.floor(rect.top / this.cell_size);
        const end_row = Math.floor(rect.bottom / this.cell_size);

        for (let col = start_col; col <= end_col; col++) {
            for (let row = start_row; row <= end_row; row++) {
                const cell = this.cells[this.get_key(col, row)];
                if (cell) {
                    for (let i = 0; i < cell.length; i++) {
                        found_entities.add(cell[i]);
                    }
                }
            }
        }
        return found_entities;
    }
};

/**
 * High-level orchestrator to rebuild the grid every frame.
 * Only inserts entities relevant to the current game state.
 */
function rebuild_spatial_hash() {
    SPATIAL_GRID.clear();

    //  Player is always relevant
    if (is_entity_valid(base_level_entities.bazis)) {
        SPATIAL_GRID.insert(base_level_entities.bazis);
        insert_active_pool_to_grid(base_level_entities.bazis_shots);
    }

    //  Traffic State: standard combat
    if (game_data.game_states.traffic_flag) {
        insert_active_pool_to_grid(base_level_entities.enemy_ships);
        insert_active_pool_to_grid(base_level_entities.enemy_shots);
        
    }

    //  Bounty State
    if (game_data.game_states.bounty_flag) {
        if (is_entity_valid(base_level_entities.bounty)) SPATIAL_GRID.insert(base_level_entities.bounty);
        if (is_entity_valid(base_level_entities.powerup)) SPATIAL_GRID.insert(base_level_entities.powerup);
    }

    //  Boss State
    if (game_data.game_states.boss_flag) {
        if (is_entity_valid(boss_level_entities.boss)){
            boss_data = boss_level_entities.boss;
            const { EMP_STRIKE_ZONE_X_PX, EMP_STRIKE_ZONE_Y_PX } = COLLISION_CONFIG;
            const influence_rect = {
                left: boss_data.rect.left - EMP_STRIKE_ZONE_X_PX,
                right: boss_data.rect.right + EMP_STRIKE_ZONE_X_PX,
                top: boss_data.rect.top - EMP_STRIKE_ZONE_Y_PX,
                bottom: boss_data.rect.bottom + EMP_STRIKE_ZONE_Y_PX,
                width: boss_data.rect.width + (EMP_STRIKE_ZONE_X_PX * 2),
                height: boss_data.rect.height + (EMP_STRIKE_ZONE_Y_PX * 2)
            };
            SPATIAL_GRID.insert(boss_data, influence_rect);
        }
        if (is_entity_valid(boss_level_entities.asteroid)) SPATIAL_GRID.insert(boss_level_entities.asteroid);
        insert_active_pool_to_grid(boss_level_entities.boss_shots);
    }
}

/**
 * Helper to filter and insert active entities from a pool.
 */
function insert_active_pool_to_grid(pool) {
    if (!pool) return;
    for (let i = 0; i < pool.length; i++) {
        const entity = pool[i];
        if (entity.is_active && is_entity_valid(entity)) {
            SPATIAL_GRID.insert(entity);
        }
    }
}
