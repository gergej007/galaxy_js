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
 * Initializes or resizes a generic pool of game objects.
 * @param {Array} pool - The array representing the pool (e.g., enemyPool).
 * @param {Function} create_element_fn - A function that returns a new jQuery DOM element for the pool.
 * @param {string} initial_display - CSS display style for inactive elements ('none' or 'hidden').
 * @param {number} target_pool_size - The desired total number of elements in the pool.
 * @param {string} [type='generic'] - Optional string to identify the pool in console messages.
 * @returns {Array} The updated pool.
 */
function initialize_generic_pool(pool, create_element_fn, initial_display, target_pool_size,
                                 type = 'generic', initial_properties = {}) {
                                    if (!pool) {
                                        console.error(`Initialization failed: The pool for ${type} is undefined!`);
                                        return;
                                    }                                
    const current_pool_size = pool.length;

    if (target_pool_size > current_pool_size) {
        const elements_to_add = target_pool_size - current_pool_size;

        for (let i = 0; i < elements_to_add; i++) {

            const dom_element = create_element_fn();
            dom_element.css({ 
                position: 'absolute',
                display: initial_display });
            dom_element.appendTo($("body"));

            // Create the base data object
            const entity_data = {
                element: dom_element,
                is_active: false,
                rect: { ...POOL_STYLES.ZERO_RECT },
                type: type 
            };
            
            Object.assign(entity_data, initial_properties); //  Merging custom properties 

        pool.push(entity_data);

        }
        console.log(`${type} pool grown from ${current_pool_size} to ${target_pool_size}`);
    }
    // Shrink/deactivate excess 
    else if (target_pool_size < current_pool_size) {
        for (let i = target_pool_size; i < current_pool_size; i++) {
            const entity_data = pool[i];
            if (entity_data.is_active) {
                entity_data.element.stop(true, true);
            }
            entity_data.element.css({ display: initial_display });
            entity_data.is_active = false;
            // Reset other properties as needed
        }
        console.log(`${type} pool shrunk from ${current_pool_size} to ${target_pool_size}`);
    }
    return pool;
}


function initialize_all_pools() {
    const {ENEMY_DAMAGE, BAZIS_SHOT_DAMAGE, ENEMY_SHOT_DAMAGE, TRACK_LAZER_DAMAGE, BOSS_SHOT_DAMAGE} = DEFAULT_VALUES;
    const {ENEMY, BAZIS_SHOT, ENEMY_SHOT, HOMING_MISSILE, TRACKING_LAZER, BOSS_SHOT} = ENTITY_TYPES;

    const current_game_level = game_data.levels.act_level;
    const target_enemy_count = get_required_enemy_poolsize( current_game_level);
    const target_bazis_shot_count = get_required_bazis_shot_poolsize( current_game_level);
    const target_enemy_shot_count = get_required_enemy_shot_poolsize( current_game_level);
    const target_homing_missile_count = POOL_LIMITS.H_MISSILE_COUNT;
    const tracking_lazer_count = POOL_LIMITS.TRACK_LAZER_COUNT;
    const boss_shot_count = POOL_LIMITS.BOSS_SHOT_COUNT;

    initialize_generic_pool(
        pool_state.pools.enemy_pool,
        () => create_new_enemy_element(), 
        'none',
        target_enemy_count,
        ENEMY, 
        {img_element : null, damage : ENEMY_DAMAGE, speed : 0, moving_direction : null, 
         hp : current_level_config.enemy_hp, max_hp : current_level_config.enemy_hp, id : 0} );

    initialize_generic_pool(
        pool_state.pools.bazis_shot_pool, 
        () =>  create_new_bazis_shot_element(), 
        'none', 
        target_bazis_shot_count, 
        BAZIS_SHOT, 
        { damage: BAZIS_SHOT_DAMAGE, enemies_hit_ids: new Set()} );

    initialize_generic_pool(
        pool_state.pools.enemy_shot_pool,
        () => create_new_enemy_shot_element(), 
        'none',
        target_enemy_shot_count,
        ENEMY_SHOT, 
        { damage : ENEMY_SHOT_DAMAGE, shooter_id: 0 } );

    initialize_generic_pool(
        pool_state.pools.homing_missile_pool,
        ()=> create_new_homing_missile_element(),
        'none', 
        target_homing_missile_count,
        HOMING_MISSILE,
        { parent_side : null } 
    );

    initialize_generic_pool(
        pool_state.pools.tracking_lazer_pool,
        ()=> create_new_tracking_lazer_element(),
        'none',
        tracking_lazer_count,
        TRACKING_LAZER,
        { damage: TRACK_LAZER_DAMAGE}
    );

    initialize_generic_pool(
        pool_state.pools.boss_shot_pool,
        ()=> create_new_boss_shot_element(),
        'none',
        boss_shot_count,
        BOSS_SHOT,
        { damage : BOSS_SHOT_DAMAGE, speed : 0}
    );

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
