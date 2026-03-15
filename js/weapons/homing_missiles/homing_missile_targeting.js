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
function missile_target_search( missile_data, bazis_rect) {
    if( !missile_data ||! missile_data.element || !bazis_rect) {
        console.warn("missile_target_search called with invalid missile_data.");
        return;
    }
    const missile_element = missile_data.element;
  
    const mid_line = bazis_rect.left + bazis_rect.width / 2;
    const target_left_bound = mid_line - $(window).width() * 0.35;
    const target_right_bound = mid_line + $(window).width() * 0.35;
    const target_bottom_bound = bazis_rect.top - 150;

    const final_target_data_object = missile_target_lock({ missile_data, mid_line, target_left_bound, 
                                                           target_right_bound, target_bottom_bound  });
   
    // missile_target_lock(
    //     missile_data,
    //     current_mid_line,
    //     target_left_bound,
    //     target_right_bound,
    //     target_bottom_bound
    // );

    const final_targeted_enemy_element = final_target_data_object ? $(final_target_data_object.element) : null; 

    if (final_targeted_enemy_element && final_targeted_enemy_element.length > 0) {        
        
        kill_target_obj(missile_data, final_target_data_object );
    } else 
          {               
        missile_element.animate({
            "top": -30           
        }, 1000, function(){ 
            return_homing_missile_to_pool(missile_data);
            weapons.flags.homing_missile=true; 
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
     
    const horizontal_fade = 50;
    
    let search_conditions;  
    
    if(missile_data.parent_side === "right_missile"){
        search_conditions = {
            left_bound :  mid_line - horizontal_fade,
            right_bound : target_right_bound ,
            bottom_bound : target_bottom_bound 
        };
    }
    else if(missile_data.parent_side === "left_missile") {
        search_conditions = {
            left_bound : target_left_bound ,
            right_bound : mid_line + horizontal_fade,                 
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
 * Searches through all active enemy ships to find a suitable target based on
 * provided conditions. It performs a two-pass search:
 * 1. First Pass: Attempts to find an enemy that matches the given targeting conditions
 *    (positional bounds, not locked, and optionally matching the missile's direction).
 * 2. Second Pass (Fallback): If no specific target is found, it looks for any
 *    unlocked enemy currently in the game.
 *
 * Once a target is found, it is marked as 'locked' to prevent other missiles
 * from targeting the same enemy.
 *
 * @param {object} targeting_conditions - An object defining the spatial boundaries for the target search.
 *   - `left_bound {number}`: The absolute X-coordinate of the leftmost edge of the search area.
 *   - `right_bound {number}`: The absolute X-coordinate of the rightmost edge of the search area.
 *   - `bottom_bound {number}`: The absolute Y-coordinate of the lower boundary of the search area. Enemies must be above this line. 
 * @returns {object|null} The data object for the found enemy target, or `null` if no suitable target is found.
 *   This object is expected to contain `element` (jQueryObject) and `rect` (DOMRect) properties, and an `is_active` flag.
 */
function target_selector( targeting_conditions ) {   
   
    let found_enemy_data = null;        
    
    const all_enemy_data_objects = base_level_entities.enemy_ships;        
    
    for (let i = 0; i < all_enemy_data_objects.length; i++) {    
            const enemy_data = all_enemy_data_objects[i];        
        
        if (!enemy_data.is_active || !enemy_data.element || !enemy_data.rect ) {
            continue; 
        }

        const enemy_element = enemy_data.element; 
        const enemy_rect = enemy_data.rect;              
            
        if (
               enemy_rect.left >= targeting_conditions.left_bound
            && enemy_rect.right <= targeting_conditions.right_bound         
            && enemy_rect.bottom < targeting_conditions.bottom_bound
            && !enemy_element.hasClass("locked")            
        ) {           
            found_enemy_data = enemy_data;  
            enemy_element.addClass("locked");         
            break; 
        }
    }
    
    if (!found_enemy_data) {
        
        for (let i = 0; i < all_enemy_data_objects.length; i++) {
            const enemy_data = all_enemy_data_objects[i];
           
            if (!enemy_data.is_active || !enemy_data.element || !enemy_data.rect ) {
                continue; 
            }

            const enemy_element = $(enemy_data.element);

            if (!enemy_element.hasClass("locked")) {
               
                found_enemy_data = enemy_data;
                enemy_element.addClass("locked");             
                break; 
            }
        }
    }         
    if ( !found_enemy_data) {
        return null;
    }
    return found_enemy_data;         
}  

