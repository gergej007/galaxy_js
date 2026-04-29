let spacekraft_spawn_timeout;

/**
 * Schedules the next attempt to mobilize (spawn) an enemy spacekraft after a calculated delay.
 * This function centralizes the logic for the recursive setTimeout and ensures
 * spawns only occur when game conditions allow.
 *
 * @param {number} delay - The delay in milliseconds before the next `mobilize_spacekraft` call.
 * @param {number} move_pattern - The movement pattern to use for the next spawned enemy.
 * @returns {void}
 */
function schedule_next_enemy_spawn_attempt(delay) {    
    if (spacekraft_spawn_timeout) {
        clearTimeout(spacekraft_spawn_timeout);
    }

    spacekraft_spawn_timeout = setTimeout(function () {
        
        if (game_data.game_states.traffic_flag && !game_data.game_states.boss_flag) {
            
            mobilize_spacekraft( current_level_config.direction_pattern );
        } else {
           
            spacekraft_spawn_timeout = null; 
            console.log("Enemy spawning paused.");
        }
    }, delay);
}


/**
 * Orchestrates the mobilization of an enemy ship from the pool onto the game screen.
 * 
 * Performs a series of safety and collision checks to ensure the enemy spawns
 * in a valid lane without overlapping existing entities. If a safe position 
 * is found, it triggers the ship's animation and schedules the next spawn.
 * 
 * @async
 * @function mobilize_spacekraft
 * @param {number} move_pattern - The current game's vertical lane pattern ( 1, 2 or 4).
 * @returns {Promise<void>} - Resolves once the mobilization attempt is complete.
 * 
 * @example
 * // Mobilize an enemy using a 4-lane pattern
 * await mobilize_spacekraft(4);
 * 
 * @description
 * 1. Aborts if 'game_data.game_states.traffic_flag' is false.
 * 2. Retrieves an available enemy object from the pool.
 * 3. Resets enemy CSS to teleport it off-screen and disable transitions.
 * 4. Calls find_safe_spawn_spot() to calculate a valid Y-coordinate and lane.
 * 5. Performs a proximity check against the current bounty lane.
 * 6. Triggers setup_spacekraft_animation_behaviour() to begin movement.
 * 7. Increments the total enemy counter.
 * 8. Schedules the next enemy spawn attempt based on 'current_level_config'.
 */                                                     
async function mobilize_spacekraft(move_pattern) { 

    const current_move_pattern = move_pattern; 
    const { level_multiplier_load, level_seed_load } = current_level_config;
    const rnd_load_time = (Math.random() * level_multiplier_load) + level_seed_load; 
    
    const enemy_data = get_from_pool(POOL_KEYS.ENEMY);
    if (!enemy_data) {
        schedule_next_enemy_spawn_attempt(rnd_load_time);
        return;
    } 
    
    reset_element_css(enemy_data);
    
    try {
        await configure_pooled_spacekraft(enemy_data); 
    } catch (error) {
        return_enemy_to_pool(enemy_data); 
        schedule_next_enemy_spawn_attempt(rnd_load_time);
        return;
    }   
    // Find safe lane
    const result_lane_info = find_safe_spawn_spot(enemy_data, current_move_pattern);
    if (!result_lane_info) {
        console.warn("Could not find safe spot, returning to pool.");
        return_enemy_to_pool(enemy_data);
        schedule_next_enemy_spawn_attempt(rnd_load_time);
        return;
    }    
    // Provide safe zone for Bounty
    if ( game_data.game_states.bounty_flag ) {
        if ( check_enemy_in_bounty_lane(enemy_data.element, enemy_data.rect.top, current_move_pattern, base_level_entities.bounty)) {
            return_enemy_to_pool(enemy_data); 
            schedule_next_enemy_spawn_attempt(rnd_load_time);
            return;
        }  
    }  
    // Execute animation
    setup_spacekraft_animation_behaviour(enemy_data, result_lane_info);
    
    game_data.counters.enemies++;  
    schedule_next_enemy_spawn_attempt(rnd_load_time);           
}  

/**
 * Searches for a valid, non-colliding coordinate and lane for an enemy ship.
 * 
 * Iterates through a series of random lane selections and Y-coordinates, 
 * performing a vertical and horizontal proximity check against existing ships. 
 * If a safe spot is found, it returns the lane-specific movement data.
 * 
 * @function find_safe_spawn_spot
 * @param {Object} enemy_data - The data object for the enemy being spawned.
 * @param {number} move_pattern - The current game's vertical lane pattern ( 1, 2, or 4).
 * @returns {Object|null} - An object containing lane information and coordinates if 
 *        successful, otherwise null if the maximum number of attempts is reached.
 * @property {number} pozy_top - The calculated vertical starting coordinate.
 * @property {Object} lane_info - An object containing direction (pozx), 
 *        destination (anim_pozx), direction (moving_class), and flip (transform_Y).
 * 
 * @description
 * 1. Calculates the playable area based on the window height and 55px top offset.
 * 2. Picks a random lane (1 to move_pattern) and calculates its vertical boundaries.
 * 3. Generates a random Y-coordinate (pozy_top) within the lane, with padding.
 * 4. Calls divide_screen_to_lanes() to retrieve direction and X-axis data.
 * 5. Temporarily updates enemy_data.rect to perform a proximity check against 
 *    active enemies on the screen.
 * 6. Repeats up to 15 times before returning null if no safe spot is found.
 */
function find_safe_spawn_spot( enemy_data, move_pattern) {

    const { PLAY_AREA_HEIGHT_FACTOR, VERTICAL_OFFSET, MAX_SPAWN_ATTEMPTS, ELEM_DEFAULT_WIDTH,
            ELEM_DEFAULT_HEIGHT, LANE_PADDING_PX} = ENEMY_SPAWN_CONFIG;

    const play_area_height = $(window).height() * PLAY_AREA_HEIGHT_FACTOR;
    let is_position_safe = false;
    let attempts = 0;

    const win_width = $(window).width();
    const enemy_width = enemy_data.element[0].offsetWidth || ELEM_DEFAULT_WIDTH;
    const enemy_height = enemy_data.element[0].offsetHeight || ELEM_DEFAULT_HEIGHT;

    while (!is_position_safe && attempts < MAX_SPAWN_ATTEMPTS) {
        // 1. Pick a random lane first (1 to move_pattern)
        const lane_num = Math.floor(Math.random() * move_pattern) + 1;
        const lane_height = play_area_height / move_pattern;
        const lane_top = lane_height * (lane_num - 1) + VERTICAL_OFFSET;
        
        // 2. Calculate a safe Y inside that specific lane
        const padding = LANE_PADDING_PX;
        const spawnable_height = lane_height - enemy_height - (padding * 2);
        const pozy_top = Math.floor(Math.random() * spawnable_height) + lane_top + padding;

        // 3. Get direction info for this Y
        const lane_info = divide_screen_to_lanes(enemy_data, pozy_top, move_pattern);
        if (!lane_info) { attempts++; continue; }

        // 4. Set starting X based on direction
        const start_left = (lane_info.selected_j % 2 !== 0) ? -enemy_width  : win_width;

        // 5. Update rect for the collision check
        enemy_data.rect = { 
            top: pozy_top, 
            left: start_left,
            width: enemy_width, 
            height: enemy_height 
        };

        if (!check_spawn_proximity_conflict(enemy_data)) {
            is_position_safe = true;
            return lane_info;
        } else {
            attempts++;      
        }            
    }
    return null;
}

/**
 * Resets an enemy ship's CSS properties to a neutral, off-screen state 
 * before it is mobilized.
 * 
 * This function "teleports" the ship instantly to a safe position by 
 * disabling CSS transitions and forcing a browser reflow. 
 * 
 * @function reset_element_css
 * @param {Object} enemy_data - The data object representing the enemy ship.
 * @param {jQuery|HTMLElement[]} enemy_data.element - The DOM element of the enemy ship, 
 *        typically as a jQuery-wrapped array.
 * @returns {void}
 */
function reset_element_css(enemy_data) {
   const enemy_element = $(enemy_data.element);

   if(!enemy_element || enemy_element.length === 0) return;

   enemy_element.stop(true, true).css(ENEMY_SPAWN_CONFIG.RESET_STYLE);    
 
   void enemy_element[0].offsetHeight;
};
                