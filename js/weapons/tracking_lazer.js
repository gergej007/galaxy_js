let lazer_shot_counter = 0; 
let tracking_lazer_timeout = null; 
/**
 * Main function for the Tracking Lazer weapon.
 * Manages the lifecycle of the tracking lazer.
 * It checks if the weapon is active and then triggers the core tracking and killing logic.
 * It also manages the recursive call for the next tracking cycle.
 *
 * @returns {void}
 */                                  
async function tracking_lazer_scheduler() {
    
    if (tracking_lazer_timeout) {
        clearTimeout(tracking_lazer_timeout);
        tracking_lazer_timeout = null;
    }
    
    if (!weapons.flags.tracking_lazer ) {
        return;
    }
    
    await tracking_lazer_core_logic();
    
    const interval = SECONDARY_WEAPONS_CONFIG.TRACKING_LAZER.TRACKING_LAZER_INTERVAL;
    tracking_lazer_timeout = setTimeout(tracking_lazer_scheduler, interval);
}

/**
 * Orchestrates the firing sequence of the Tracking Lazer weapon.
 * 
 * Logic flow:
 * 1. Validates player state and ensures a minimum number of enemies are present.
 * 2. Filters active enemies currently within the defined targeting field of view.
 * 3. Iterates through valid targets up to the burst limit.
 * 4. Triggers a frame-synced animation for each lazer shot, ensuring the line
 *    visually follows both the moving player and the moving target.
 * 
 * @async
 * @returns {Promise<void>} Resolves when the current burst sequence is complete.
 */
async function tracking_lazer_core_logic() {
    lazer_shot_counter = 0; 

    const { MIN_ACTIVE_ENEMIES, MAX_TRACKED_ENEMIES_PER_BURST, AUDIO_KEY, MS_BETWEEN_SHOTS
          } = SECONDARY_WEAPONS_CONFIG.TRACKING_LAZER;

    const bazis_data = base_level_entities.bazis;
     if ( !is_entity_valid(bazis_data)) {
        console.log("Bazis not found in DOM for tracking lazer.");
        return; 
    }
   
    const bazis_rect = bazis_data.rect;   
    
    const active_enemies = base_level_entities.enemy_ships.filter(enemy_data => {
        return enemy_data.is_active && is_entity_valid(enemy_data);
    });

    if( active_enemies.length < MIN_ACTIVE_ENEMIES ){
        return;
    }
    const search_conditions = define_target_field_bounds( bazis_rect );
    
    for (const enemy_data of active_enemies) {
        
        if ( lazer_shot_counter >= MAX_TRACKED_ENEMIES_PER_BURST || !weapons.flags.tracking_lazer) {
            console.log("Tracking lazer stopped.");    
            break;
        }
        if(!evaluate_target_field_bounds(enemy_data.rect, search_conditions)) continue;                
                         
            
        const lazer_data = get_from_pool(POOL_KEYS.TRACKING_LAZER);
        if (!lazer_data) {
            
            continue;
        }            
        audio_play(AUDIO_KEY);  
        lazer_shot_counter++;   
     
        await animate_tracking_lazer_shot(lazer_data, enemy_data, bazis_data);
           
        await new Promise(resolve => setTimeout(resolve, MS_BETWEEN_SHOTS)); 
    }
}

/**
 * Executes the visual lifecycle of a single tracking lazer shot.
 * 
 * Sets the initial geometric properties, animates the lazer's opacity,
 * and handles the destruction of the target ship and pool cleanup 
 * upon animation completion.
 * 
 * @param {Object} lazer_data - The pooled entity data for the lazer line.
 * @param {Object} enemy_data - The data object for the targeted enemy ship.
 * @param {Object} bazis_data - The data object for the player entity.
 * @returns {Promise<void>} A promise that resolves when the shot interaction is finished.
 */
function animate_tracking_lazer_shot(lazer_data, enemy_data, bazis_data) {
    const { ANIMATION_DURATION, ANIMATION_EASING } = SECONDARY_WEAPONS_CONFIG.TRACKING_LAZER;
    const line_props = create_line_properties(enemy_data.rect, bazis_data.rect);
    lazer_data.element.css({
        ...line_props,
        opacity: 0,
        display: "block"
    }).appendTo($("body"));

    return new Promise(resolve => {
        lazer_data.element.animate({
            "opacity": 1  
        }, ANIMATION_DURATION, ANIMATION_EASING, function () {
           
            explode_spacekraft(enemy_data); 
            add_score_n_hit();            
            
            return_tracking_lazer_to_pool(lazer_data);                        
            resolve(); 
        });
    });
}

/**
 * Calculates the rectangular boundaries of the tracking lazer's effective field of view.
 * 
 * Uses configured vertical factors and horizontal offsets relative to the player's 
 * current position and screen dimensions to define where targets can be acquired.
 * 
 * @param {DOMRect} bazis_rect - The bounding box of the player's bazis.
 * @returns {Object} Boundary coordinates: { left_bound, right_bound, bottom_bound, top_bound }.
 */
function define_target_field_bounds( bazis_rect) {

    const { TOP_BOUND_FACTOR, BOTTOM_BOUND_FACTOR, RAW_HORIZONTAL_BOUND_FACTOR, TARGET_HORIZONTAL_BOUND_PX} 
    = SECONDARY_WEAPONS_CONFIG.TRACKING_LAZER;

    const target_bound_top = $(window).height() * TOP_BOUND_FACTOR; 
    const target_bound_bottom = $(window).height() * BOTTOM_BOUND_FACTOR;
    const bazis_mid = bazis_rect.left + bazis_rect.width / 2;
    const raw_left_bound = bazis_mid - $(window).width() * RAW_HORIZONTAL_BOUND_FACTOR;
    const raw_right_bound = bazis_mid + $(window).width() * RAW_HORIZONTAL_BOUND_FACTOR;
    const target_bound_left = Math.max( TARGET_HORIZONTAL_BOUND_PX, raw_left_bound);
    const target_bound_right = Math.min($(window).width() - TARGET_HORIZONTAL_BOUND_PX, raw_right_bound);

    return  { 
        left_bound: target_bound_left,
        right_bound: target_bound_right,
        bottom_bound: target_bound_bottom, 
        top_bound: target_bound_top 
    };
}

/**
 * Checks if a specific enemy ship is within the acquisition zone of the tracking lazer.
 * 
 * Verifies the enemy's coordinates against defined horizontal and vertical bounds, 
 * ensuring the game is not currently in an exit state.
 * 
 * @param {DOMRect} enemy_rect - The bounding box of the enemy ship.
 * @param {Object} search_conditions - The boundary coordinates calculated for targeting.
 * @returns {boolean} True if the enemy is a valid target, false otherwise.
 */
function evaluate_target_field_bounds( enemy_rect, search_conditions ){

    if( enemy_rect.top >= search_conditions.top_bound &&
        enemy_rect.bottom <= search_conditions.bottom_bound &&
        enemy_rect.left >= search_conditions.left_bound &&
        enemy_rect.right <= search_conditions.right_bound &&
        !game_data.game_states.exit_flag ){ 
            return true;
        }
    return false;    
}

/**
 * Calculates line properties using pre-existing rect data.
 * @param {Object} enemy_rect - The pre-calculated rect of the target.
 * @param {Object} bazis_rect - The pre-calculated rect of the player.
 */
function create_line_properties(enemy_rect, bazis_rect) {
    const { LINE_THICKNESS_PX, DEGREES_PER_RADIAN, MOVING_SPAWN_MULTIPLIER } = SECONDARY_WEAPONS_CONFIG.TRACKING_LAZER;

    // Center coordinates for enemy
    const dx1 = enemy_rect.left + enemy_rect.width / 2;
    const dy1 = enemy_rect.top + enemy_rect.height / 2;

    // Center coordinates for player (including movement inertia offset)
    const dx2 = bazis_rect.left + bazis_rect.width / 2 + (get_player_movement_offset() * MOVING_SPAWN_MULTIPLIER);
    const dy2 = bazis_rect.top + bazis_rect.height / 2;

    // Use Math.hypot for cleaner distance calculation
    const length = Math.hypot(dx2 - dx1, dy2 - dy1);
    
    const cx = ((dx1 + dx2) / 2) - (length / 2);
    const cy = ((dy1 + dy2) / 2) - (LINE_THICKNESS_PX / 2);
    
    // Calculate angle in degrees
    const angle = parseInt(Math.atan2((dy1 - dy2), (dx1 - dx2)) * (DEGREES_PER_RADIAN / Math.PI));

    return {
        left: cx,
        top: cy,
        width: length,
        height: LINE_THICKNESS_PX,
        transform: `rotate(${angle}deg)`
    };
}