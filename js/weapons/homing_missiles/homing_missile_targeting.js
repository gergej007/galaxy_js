/**
 * Initiates the target search and engagement sequence for a homing missile.
 * This function calculates search boundaries based on the bazis's position,
 * attempts to find a suitable enemy target using `missile_target_lock`,
 * and then either engages the target via `kill_target_obj` or animates the missile
 * off-screen if no target is found.
 *
 * @param {object} missile_data - The data object representing the homing missile that is searching for a target.
 * @param {DOMRect} bazis_rect - The DOMRect object representing the current position and dimensions of the bazis.
 * @returns {void} This function does not return a value.
 */                                                                 
function missile_target_search( missile_data) {
    if( !is_entity_valid(missile_data) ) {
        console.warn("missile_target_search called with invalid missile_data.");
        return;
    }
    const missile_element = missile_data.element;
    const missile_rect = missile_data.rect;

    const { HORIZONTAL_BOUND_FACTOR, BOTTOM_BOUND_PX, NO_TARGET_ANIM_TOP, NO_TARGET_ANIM_DURATION            
        } = SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.TARGETING;
  
    const mid_line = missile_rect.left + missile_rect.width / 2;
    const target_left_bound = mid_line - $(window).width() * HORIZONTAL_BOUND_FACTOR;
    const target_right_bound = mid_line + $(window).width() * HORIZONTAL_BOUND_FACTOR;
    const target_bottom_bound = missile_rect.top - BOTTOM_BOUND_PX;

    const final_target_data_object = missile_target_lock({ missile_data, mid_line, target_left_bound, 
                                                           target_right_bound, target_bottom_bound  });
      

    const final_targeted_enemy_element = final_target_data_object ? $(final_target_data_object.element) : null; 

    if (final_targeted_enemy_element && final_targeted_enemy_element.length > 0) {        
        
        kill_target_obj(missile_data, final_target_data_object );
    } else 
          {               
        missile_element.animate({
            "top": NO_TARGET_ANIM_TOP           
        }, NO_TARGET_ANIM_DURATION, function(){ 
            return_homing_missile_to_pool(missile_data);
            weapons.flags.homing_missile = true; 
        });
    }
}

/**
 * Determines specific search conditions for a homing missile based on its direction
 * and calls `target_selector` to find an enemy.
 *
 * @param {object} params - The parameters for the target locking process.
 * @param {object} params.missile_data - The data object for the homing missile (expected to contain `parent_side`).
 * @param {number} params.mid_line - The absolute X-coordinate of the bazis's center line.
 * @param {number} params.target_left_bound - The absolute X-coordinate of the leftmost edge for the search area.
 * @param {number} params.target_right_bound - The absolute X-coordinate of the rightmost edge for the search area.
 * @param {number} params.target_bottom_bound - The absolute Y-coordinate of the lower boundary for the search area. Enemies must be above this line.
 * @returns {object|null} The data object for the found enemy target (which includes its element, rect, etc.), or `null` if no target was found.
 */       
function missile_target_lock( {missile_data, mid_line, target_left_bound, target_right_bound, target_bottom_bound} ) {
     
    const { HORIZONTAL_TARGETING_DEAD_ZONE, RIGHT_MISSILE_SIDE, LEFT_MISSILE_SIDE} = SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.TARGETING;
    let search_conditions;  
    
    if(missile_data.parent_side === RIGHT_MISSILE_SIDE) {
        search_conditions = {
            left_bound :  mid_line  + HORIZONTAL_TARGETING_DEAD_ZONE ,
            right_bound : target_right_bound ,
            bottom_bound : target_bottom_bound 
        };
    }
    else if(missile_data.parent_side === LEFT_MISSILE_SIDE) {
        search_conditions = {
            left_bound : target_left_bound ,
            right_bound : mid_line  - HORIZONTAL_TARGETING_DEAD_ZONE ,                 
            bottom_bound : target_bottom_bound
        };                                               
    }         

    const final_enemy_data = target_selector( search_conditions );   

    if (final_enemy_data === null) { 
        return null;      
    }
    return final_enemy_data;
}

/**
 * Selects a suitable enemy target for a homing missile using iterative search passes.
 * 
 * Logic flow:
 * 1. Checks active enemies against current spatial boundaries.
 * 2. Skips entities already locked by other projectiles to ensure target variety.
 * 3. If no target is found, expands the search radius and retries up to a maximum limit.
 * 4. Marks the successful target with a 'locked' class to prevent double-targeting.
 * 
 * @param {Object} targeting_conditions - Spatial bounds for acquisition {left_bound, right_bound, bottom_bound}.
 * @returns {Object|null} The data object of the acquired enemy ship, or null if all attempts fail.
 */
function target_selector(targeting_conditions) {
    let found_enemy_data = null;
    let targeting_attempts = 0;  

    const { TARGET_LOCKED_CLASS, MAX_ATTEMPTS, EXPAND_SEARCH_AREA_PX } = SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.TARGETING;
    const all_enemies = base_level_entities.enemy_ships;

    while (targeting_attempts < MAX_ATTEMPTS && !found_enemy_data) {
        for (let i = 0; i < all_enemies.length; i++) {
            const enemy_data = all_enemies[i];

            if (!enemy_data.is_active || !is_entity_valid(enemy_data)) continue;

            const $el = enemy_data.element;
            const rect = enemy_data.rect;

            // Targeting Logic
            const is_in_bounds = rect.left >= targeting_conditions.left_bound &&
                                 rect.right <= targeting_conditions.right_bound &&
                                 rect.bottom < targeting_conditions.bottom_bound;

            if (is_in_bounds && !$el.hasClass(TARGET_LOCKED_CLASS)) {
                found_enemy_data = enemy_data;
                $el.addClass(TARGET_LOCKED_CLASS);
                break; 
            }
        }
        
        targeting_attempts++;
        
        // If no target found, expand search bounds for the next attempt
        if (!found_enemy_data) {
            targeting_conditions.left_bound -= EXPAND_SEARCH_AREA_PX;
            targeting_conditions.right_bound += EXPAND_SEARCH_AREA_PX;
        }
    }

    return found_enemy_data;  
}
