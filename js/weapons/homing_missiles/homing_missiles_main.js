let homing_missile_timeout;
let missile_prep_timeout;

/**
 * Schedules the next attempt to launch homing missiles after a cooldown.
 * This helper function centralizes the logic for the recursive setTimeout.
 * It also acts as the primary gatekeeper for the entire missile launch cycle.
 *
 * @returns {void}
 */
function schedule_next_missile_launch_attempt() {   
    if (homing_missile_timeout) {
        clearTimeout(homing_missile_timeout);
    }
    
    homing_missile_timeout = setTimeout(() => {     
        if(!weapons.flags.homing_missile){
            homing_missile_timeout = null;            
            return; 
        }      
       
        if ( !is_entity_valid(base_level_entities.bazis)) {            
            schedule_next_missile_launch_attempt(); 
            return; 
        }        
        launch_missile_projectiles(); 
        schedule_next_missile_launch_attempt();
    }, SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.MAIN.MISSILE_LAUNCH_INTERVAL); 
}

/**
 * Initiates the multi-phase deployment sequence for homing missiles.
 * 
 * This function orchestrates the lifecycle of missile projectiles by:
 * 1. Validating launch conditions (weapon state, player status, and environment).
 * 2. Retrieving missile entities from an object pool for memory efficiency.
 * 3. Calculating wing-relative offsets to ensure projectiles appear to spawn from the ship's wings.
 * 4. Executing a two-phase deployment animation (horizontal spread then vertical ascent).
 * 5. Maintaining frame-by-frame synchronization with the player's movement during deployment.
 * 6. Handing off control to the targeting logic upon completion of the launch sequence.
 *
 * @async
 * @returns {void}
 */
function launch_missile_projectiles() {
    if (!missile_launch_conditions_evaluation()) {
        schedule_next_missile_launch_attempt();
        return;
    }

    const config = SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.MAIN;
    const bazis_data = base_level_entities.bazis;

    missile_prep_timeout = setTimeout(() => {
        // if (!is_entity_valid(bazis_data) || !missile_launch_conditions_evaluation()) return;
        if (!is_entity_valid(bazis_data) || !bazis_data.rect || !$(bazis_data.element).is(':visible')) return;

        for (let factor = config.PLACEMENT_START_VALUE; factor <= config.PLACEMENT_END_VALUE; factor += config.PLACEMENT_INCREMENT) {
            const missile_data = get_from_pool(POOL_KEYS.HOMING_MISSILE);
            if (!missile_data) continue;

            // Initialize Missile Position & Metadata
            const wing_px = bazis_data.rect.width * config.OFFSET_X_FACTOR;
            missile_data.launch_internal_offset = (bazis_data.rect.width / 2) + (factor * wing_px) - (config.WIDTH / 2);
            missile_data.parent_side = (factor < 0) ? config.LEFT_MISSILE_SIDE : config.RIGHT_MISSILE_SIDE;

            animate_missile_deployment({missile_data, bazis_data, factor, config});
        }
    }, config.LAUNCH_PREPARE_DELAY);
}

/**
 * Orchestrates the two-stage deployment sequence for a homing missile.
 * 
 * This function manages the transition from a pooled object to an active projectile
 * by executing a synchronized animation timeline:
 * 
 * 1. **Initial Placement**: Teleports the missile to the ship's wing and initializes 
 *    logical coordinates before showing the element to prevent visual flashing.
 * 2. **Phase 1 (Horizontal Deployment)**: Slides the missile outward from the ship's center
 *    using a virtual 'anim_X' object. A step function keeps it synced with the ship's 
 *    movement in real-time.
 * 3. **Phase 2 (Vertical Ascent)**: Slides the missile forward (upward) while maintaining
 *    horizontal alignment with the wing.
 * 4. **Independence & Targeting**: Upon completion (or if the ship is destroyed), 
 *    the missile detaches from the ship and initiates autonomous target seeking.
 *
 * @param {Object} params - The deployment parameters.
 * @param {Object} params.missile_data - The data object for the projectile (contains element, rect, is_active).
 * @param {Object} params.bazis_data - The player's ship entity object used for position tracking.
 * @param {number} params.factor - The wing multiplier (-1 for Left wing, 1 for Right wing).
 * @param {Object} params.config - Configuration constants for animation durations and distances.
 * @returns {void}
 */
function animate_missile_deployment({missile_data, bazis_data, factor, config}) {
    const side_distance = factor * config.PRE_LAUNCH_DISTANCE_X;

    if (!is_entity_valid(bazis_data)) {
        return;
    }
    
    missile_element = missile_data.element;

    const start_X = bazis_data.rect.left + missile_data.launch_internal_offset;
    const start_Y = bazis_data.rect.top;

    initialize_missile_spawn({missile_data, start_X, start_Y, config});
   
    missile_element.show();   
          
    // Show and Place
    missile_element.find(`.${SECONDARY_WEAPONS_CONFIG.HOMING_MISSILE.IMAGE.IMG_CLASS}`).show();
    // Virtual Animation
    // Phase 1: Outward Move
    const phase1_anim = { anim_X: 0 };
    $(phase1_anim).animate({ anim_X: side_distance }, {
        duration: config.ANIMATION_DURATION_1,
        step: (now_X) => sync_missile_with_bazis({missile_data, bazis_data, horizontal_offset: now_X,vertical_offset: 0, 
                                                 anim_obj:phase1_anim}),
        complete: () => {
            // Phase 2: Upward Move
            if(!is_entity_valid(bazis_data) || !missile_data.is_active){ return }
            const phase2_anim = { anim_Y: 0 };
            $(phase2_anim).animate({ anim_Y: -config.PRE_LAUNCH_DISTANCE_Y }, {
                duration: config.ANIMATION_DURATION_2,
                step: (now_Y) => sync_missile_with_bazis({missile_data, bazis_data, horizontal_offset:side_distance, vertical_offset:now_Y, 
                                                         anim_obj:phase2_anim}),
                complete: () => {
                    if(!is_entity_valid(bazis_data) || !missile_data.is_active){ return }
                    missile_target_search(missile_data)
                }
            });
        }
    });
}

/**
 * Maintains frame-by-frame synchronization between a deploying missile and Bazis.
 * 
 * This function is called by the animation 'step' callback to:
 * 1. Calculate the missile's absolute position based on the ship's current location 
 *    plus the current animation offsets (horizontal and vertical).
 * 2. Update the missile's DOM element and its internal data object (rect) to 
 *    ensure accurate collision detection and future targeting.
 * 3. **Critical Safety**: Monitors the ship's health. If the ship is destroyed during 
 *    deployment, it immediately stops the virtual animation and triggers the 
 *    missile's self-destruction to prevent logical state corruption (e.g., ghost strikes).
 *
 * @param {Object} params - The synchronization parameters.
 * @param {Object} params.missile_data - The missile entity object containing its DOM element and rect.
 * @param {Object} params.bazis_data - The player's ship entity object to track.
 * @param {number} params.horizontal_offset - The current relative X-offset from the wing (from Phase 1 animation).
 * @param {number} params.vertical_offset - The current relative Y-offset from the ship (from Phase 2 animation).
 * @param {Object} [params.anim_obj] - The jQuery virtual animation object. Used to stop the timer if the ship dies.
 * @returns {void}
 */
function sync_missile_with_bazis({missile_data, bazis_data, horizontal_offset, vertical_offset, anim_obj}) {
    // If the ship dies during sync, trigger an immediate explosion
    if (!is_entity_valid(bazis_data) || !bazis_data.rect) {        
        
        if (anim_obj) $(anim_obj).stop();
        explode_spacekraft(missile_data);
        return;
    }

    if (!is_entity_valid(missile_data) || !missile_data.rect) return;

    const missile_element = missile_data.element;
    const final_X = bazis_data.rect.left + missile_data.launch_internal_offset + horizontal_offset;
    const final_Y = bazis_data.rect.top + vertical_offset;

    missile_element.css({ left: final_X, top: final_Y });

    // Update logical rect for potential mid-air collisions
    missile_data.rect.left = final_X;
    missile_data.rect.top = final_Y;
    missile_data.rect.right = final_X + missile_element.width();
    missile_data.rect.bottom = final_Y + missile_element.height();
}

/**
 * Evaluates the conditions required for homing missiles to be launched.
 * This includes checking if the homing missile weapon is active, if there's
 * traffic (enemies) on screen, if a tracking lazer is active (as a conflict),
 * and if the game is in an exit state.
 *
 * @returns {boolean} True if all conditions for launching homing missiles are met, false otherwise.
 */
function missile_launch_conditions_evaluation(){
    if(    weapons.flags.homing_missile 
        && game_data.game_states.traffic_flag 
        && !weapons.flags.tracking_lazer
        && !game_data.game_states.exit_flag){
            return true;
        }
    return false;
}

/**
 * Synchronizes the missile's physical (DOM) and logical (data) state 
 * for its initial appearance on the ship's wing.
 */
function initialize_missile_spawn({missile_data, start_X, start_Y, config}) {
    const missile_element = missile_data.element;

    // 1. Physical Setup: Position and show in one atomic operation
    missile_element.css({
        left: start_X,
        top: start_Y,
        display: 'block',
        opacity: 1
    }).appendTo("body");

    // 2. Logical Setup: Ensure the rect object is valid and updated
    if (!missile_data.rect) {
        missile_data.rect = { 
            top: start_Y, 
            left: start_X, 
            width: config.WIDTH, 
            height: config.HEIGHT,
            bottom: start_Y + config.HEIGHT, 
            right: start_X + config.WIDTH 
        };
    } else {
        missile_data.rect.left = start_X;
        missile_data.rect.top = start_Y;
    }
}
