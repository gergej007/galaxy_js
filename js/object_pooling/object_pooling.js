// --- Global Pools for Object Pooling ---
const pool_state = {
    pools: {
        enemy_pool: [],
        bazis_shot_pool: [],
        enemy_shot_pool: [],
        homing_missile_pool: [],
        tracking_lazer_pool: [],
        boss_shot_pool: []
    },
    indices: {
        enemy_pool: 0,
        bazis_shot_pool: 0,
        enemy_shot_pool: 0,
        homing_missile_pool: 0,
        tracking_lazer_pool: 0,
        boss_shot_pool: 0
    }
};

/**
 * Synchronizes an object pool to a target size while reusing existing instances.
 * Efficiently grows or shrinks the pool, manages DOM attachment via the factory, 
 * and resets properties for inactive entities to prevent memory leaks and state carryover.
 * 
 * @param {Array} pool - The array representing the object pool to synchronize.
 * @param {Function} factory - Function that returns a new jQuery DOM element for the entity.
 * @param {string} display - The initial CSS display value for the entity's DOM element.
 * @param {number} target_size - The desired total number of objects in the pool.
 * @param {string} type - The entity type identifier (e.g. BOSS).
 * @param {Object|Function} props - Static object or factory function providing initial properties.
 */
function initialize_generic_pool(pool, factory, target_size, type, props) {
    const current_size = pool.length;

    //  Create, Style, and Append new elements
    if (current_size < target_size) {
        const needed = target_size - current_size;
        for (let i = 0; i < needed; i++) {
            const $dom_element = factory();
            
            $dom_element.css({ 
                position: 'absolute',
            })
            .appendTo($("body"))
            .hide();

            const initial_props = typeof props === 'function' ? props() : { ...props };
            
            pool.push({
                element: $dom_element,
                is_active: false,
                type: type,
                rect: { ...POOL_STYLES.ZERO_RECT },
                ...initial_props
            });
        }
    } 
    //  Shrink: Cleanup DOM
    else if (current_size > target_size) {
        const extras = pool.splice(target_size);
        extras.forEach(item => {
            if (item.element) item.element.remove();
        });
    }

    //  Selective Reset: Only reset items NOT currently in use
    pool.forEach(item => {
        if (item.is_active) {           
            return; 
        }

        // Reset properties for inactive items (preparing them for the new level)
        const fresh_props = typeof props === 'function' ? props() : { ...props };
        Object.assign(item, fresh_props);

        if (item.element) {
            item.element.hide().stop(true, true);
        }
    });
}

/**
 * Configures and synchronizes all game entity pools (enemies, shots, special weapons) 
 * based on current level requirements. Orchestrates the intelligent expansion or 
 * contraction of object pools to maintain performance while resetting state 
 * for inactive entities.
 * 
 * @returns {void}
 */
function initialize_all_pools() {
    const { ENEMY, BAZIS_SHOT, ENEMY_SHOT, HOMING_MISSILE, TRACKING_LAZER, BOSS_SHOT } = POOLED_ENTITY_TYPES;
    const level = game_data.levels.act_level;

    const configs = [
        { pool: pool_state.pools.enemy_pool, factory: create_new_enemy_element, type: ENEMY, size: get_required_enemy_poolsize(level) },
        { pool: pool_state.pools.bazis_shot_pool, factory: create_new_bazis_shot_element, type: BAZIS_SHOT, size: get_required_bazis_shot_poolsize(level) },
        { pool: pool_state.pools.enemy_shot_pool, factory: create_new_enemy_shot_element, type: ENEMY_SHOT, size: get_required_enemy_shot_poolsize(level) },
        { pool: pool_state.pools.homing_missile_pool, factory: create_new_homing_missile_element, type: HOMING_MISSILE, size: POOL_LIMITS.H_MISSILE_COUNT },
        { pool: pool_state.pools.tracking_lazer_pool, factory: create_new_tracking_lazer_element, type: TRACKING_LAZER, size: POOL_LIMITS.TRACK_LAZER_COUNT },
        { pool: pool_state.pools.boss_shot_pool, factory: create_new_boss_shot_element, type: BOSS_SHOT, size: POOL_LIMITS.BOSS_SHOT_COUNT }
    ];

    configs.forEach(cfg => {
        initialize_generic_pool(
            cfg.pool, 
            cfg.factory, 
            cfg.size, 
            cfg.type, 
            POOL_DEFAULT_PROPS[cfg.type] 
        );
    });

    reset_all_pool_indices();   
}

/**
 * Resets all pool tracking indices to zero.
 * Useful after level changes or pool resizing.
 */
function reset_all_pool_indices() {
    const indices = pool_state.indices;

    if (!indices) {
        console.warn("Could not reset indices: pool_state.indices is missing.");
        return;
    }
    
    Object.keys(indices).forEach(key => {
        indices[key] = 0;
    });
    
    console.log("All pool indices reset to 0.");
}
