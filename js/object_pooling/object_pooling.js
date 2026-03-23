// --- Global Pools for Object Pooling ---

const enemy_pool = [];        
const bazis_shot_pool = [];    
const enemy_shot_pool = [];  
const homing_missile_pool = []; 
const tracking_lazer_pool = []; 
const boss_shot_pool = [];

// Keep track of the next available item in each pool
let next_enemy_index = 0;
let next_bazis_shot_index = 0;
let next_enemy_shot_index = 0;
let next_homing_missile_index = 0;
let next_tracking_lazer_index = 0;
let next_boss_shot_index = 0;

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
                rect: null,
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

// --- Specific Initialization Functions (called once at game start or level change) ---

function initialize_all_pools() {
    
    const current_game_level = game_data.levels.act_level;
    const target_enemy_count = get_required_enemy_poolsize( current_game_level);
    const target_bazis_shot_count = get_required_bazis_shot_poolsize( current_game_level);
    const target_enemy_shot_count = get_required_enemy_shot_poolsize( current_game_level);

    initialize_generic_pool(
        enemy_pool,
        () => create_new_enemy_element(), 
        'none',
        target_enemy_count,
        'Enemy', {img_element : null, damage : 25, speed : 0, moving_direction : null, 
                  hp : current_level_config.enemy_hp, max_hp : current_level_config.enemy_hp, id : 0}
    );

    initialize_generic_pool(
        bazis_shot_pool, () =>  create_new_bazis_shot_element(), 
        'none', target_bazis_shot_count, 'Bazis Shot', { damage: 10, enemies_hit_ids: new Set()} );

    initialize_generic_pool(
        enemy_shot_pool,
        () => create_new_enemy_shot_element(), 
        'none',
        target_enemy_shot_count,
        'Enemy Shot', { damage : 5, shooter_id: 0 }
    );

    const target_homing_missile_count = 4; // Adjust based on max concurrent missiles

    initialize_generic_pool(
        homing_missile_pool,
        ()=> create_new_homing_missile_element(),
        'none', 
        target_homing_missile_count,
        'Homing Missile',
        { parent_side : null } // Initial properties for missile data
    );

    const tracking_lazer_count = 10;

    initialize_generic_pool(
        tracking_lazer_pool,
        ()=> create_new_tracking_lazer_element(),
        'none',
        tracking_lazer_count,
        'Tracking Lazer'
    );

    const boss_shot_count = 20;
    initialize_generic_pool(
        boss_shot_pool,
        ()=> create_new_boss_shot_element(),
        'none',
        boss_shot_count,
        'Boss Shot',
        { damage : 10, speed : 0}
    );
    
    // Reset indexes after all pools are initialized/resized
    next_enemy_index = 0;
    next_bazis_shot_index = 0;
    next_enemy_shot_index = 0;
    next_homing_missile_index = 0;
    next_tracking_lazer_index = 0;
    next_boss_shot_index = 0;
}
