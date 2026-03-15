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
function schedule_next_enemy_spawn_attempt(delay, move_pattern) {    
    if (spacekraft_spawn_timeout) {
        clearTimeout(spacekraft_spawn_timeout);
    }

    spacekraft_spawn_timeout = setTimeout(function () {
        
        if (game_data.game_states.traffic_flag && !game_data.game_states.boss_flag) {
            
            mobilize_spacekraft( direction_pattern );
        } else {
           
            spacekraft_spawn_timeout = null; 
            console.log("Enemy spawning paused.");
        }
    }, delay);
}

/**
 * Asynchronously mobilizes (spawns) a single enemy spacekraft.
 * This function retrieves an enemy from the pool, configures its appearance and properties,
 * determines its spawn location and movement based on screen lanes, and initiates its
 * animation across the screen. It handles various conditions such as pool exhaustion,
 * configuration errors, bounty lane removal, and out-of-bounds spawning.
 *
 * This function also orchestrates the scheduling of the next enemy spawn attempt
 * via `schedule_next_enemy_spawn_attempt`.
 *
 * @param {number} move_pattern - The pattern of lanes to divide the screen into, influencing the enemy's vertical position and movement.
 * @returns {Promise<void>} A Promise that resolves when the current enemy mobilization attempt is complete.
 */
async function mobilize_spacekraft(move_pattern) {   

    const rnd_load_time = (Math.random() * level_multiplier_load) + level_seed_load; 

    const enemy_data = get_enemy_from_pool();
    if (!enemy_data) {
        console.log("Enemy pool exhausted, cannot mobilize spacekraft. Retrying spawn.");
        schedule_next_enemy_spawn_attempt(rnd_load_time, move_pattern);
        return;
    }        
    
    try {
        await configure_pooled_spacekraft(enemy_data); // Await configuration
    } catch (error) {
        console.error("Failed to configure pooled spacekraft due to error:", error);
        return_enemy_to_pool(enemy_data); 
        schedule_next_enemy_spawn_attempt(rnd_load_time, move_pattern);
        return;
    }
    const enemy_element = enemy_data.element;
    const rnd_duration = enemy_data.speed;
    const pozy_top = Math.round(Math.random() * ($(window).height() - 210)+52);      
    
    const bounty_element = $(base_level_entities.bounty.element);
    const bounty_rect = base_level_entities.bounty.rect; 
    
    if( check_enemy_in_bounty_lane( enemy_element, pozy_top, move_pattern, bounty_element, bounty_rect) ){
        return_enemy_to_pool(enemy_data); 
        schedule_next_enemy_spawn_attempt( rnd_load_time, move_pattern);
        return;
    }  
    
    const lane_info = divide_screen_to_lanes( enemy_data, pozy_top, move_pattern);

    if (lane_info) {
        const { pozx, anim_pozx, moving_class, transform_Y } = lane_info;
        setup_spacekraft_animation_behaviour( enemy_data, pozy_top, pozx, anim_pozx, moving_class, transform_Y, rnd_duration);
        game_data.counters.enemies++;  
    } else {
        // If no lane is selected, enemy is out of bounds.
        console.log("Enemy spawned out of lane, returning to pool.");
        schedule_next_enemy_spawn_attempt(rnd_load_time, move_pattern);
        return_enemy_to_pool(enemy_data);
    }
    schedule_next_enemy_spawn_attempt(rnd_load_time, move_pattern);    
}

let enemy_ship_Id = 0;
function generate_enemy_Id() {
    return `enemy-${enemy_ship_Id++}`;
}


