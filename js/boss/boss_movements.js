let current_boss_phase_index = 0; 
let boss_phase_timeout_id = null; 

/**
 * Orchestrates the boss's movement and attack phases in a predefined sequence.
 * This function cycles through the BOSS_BEHAVIOR_CONFIG.PHASE_SEQUENCE,
 * determining the current phase's movement and attack patterns. It manages
 * delays before each movement animation starts and loops the sequence indefinitely
 * until the boss is no longer active.
 *
 * Each phase's attacks are scheduled (or updated) centrally by this scheduler
 * before the movement animation for that phase begins. The movement itself
 * is then initiated after a configured delay.
 *
 * @param {object} boss_data - The boss data object (e.g., boss_level_entities.boss).
 * @returns {void}
 */
async function boss_phase_scheduler(boss_data) {

    if (boss_phase_timeout_id) {
        clearTimeout(boss_phase_timeout_id);
        boss_phase_timeout_id = null;
    }
   
    if (!game_data.game_states.boss_flag ) {
        console.log("Boss is no longer active. Stopping phase scheduler.");
        return; // Stop the scheduler if the boss is dead
    }

    // --- Access the configuration objects from BOSS_BEHAVIOR_CONFIG ---   
    const { MOVEMENT_PHASES, PHASE_SEQUENCE } = BOSS_BEHAVIOR_CONFIG; 

    // --- Determine the current phase plan from the sequence ---
    // If all phases completed, loop back to the start
    if (current_boss_phase_index >= PHASE_SEQUENCE.length) {
        current_boss_phase_index = 0; 
    }
    const current_phase_plan = PHASE_SEQUENCE[current_boss_phase_index]; 
    // e.g., { type: "boss_movement_1", config_key: "MOVEMENT_1", attacks_config_key: "PHASE_1" }
    
    // --- Retrieve specific configuration for the current phase ---
    // Get the detailed movement configuration using config_key (e.g., "MOVEMENT_1")
    const movement_config = MOVEMENT_PHASES[current_phase_plan.config_key];
   
    // --- Validate retrieved configuration ---
    if (!movement_config) {
        console.error(`Boss phase configuration error: Missing movement_config ('${current_phase_plan.config_key}') for phase ${current_boss_phase_index}. Skipping to next phase.`);
        current_boss_phase_index++; 
        boss_phase_scheduler(boss_data); // Schedule next phase 
        return;
    }

    // --- Execute Movement for this phase ---
    // Dynamically retrieve the movement function from the global scope (e.g., window.boss_movement_1)
    const movement_function = window[current_phase_plan.type]; // e.g., window['boss_movement_1']
    
    if (typeof movement_function === 'function') {
        const ATTACK_PATTERNS_FOR_PHASE = BOSS_ATTACK_CONFIG[current_phase_plan.attacks_config_key];
        if (ATTACK_PATTERNS_FOR_PHASE) {
          
            schedule_boss_attacks(boss_data, ATTACK_PATTERNS_FOR_PHASE);
        } else {
            console.warn(`No attack pattern found for key: ${current_phase_plan.attacks_config_key} for phase ${current_boss_phase_index}.`);
        }
       
        await new Promise(resolve => {
            boss_phase_timeout_id = setTimeout(async () => { 
                // Re-validate boss state after this delay, before starting animation
                if (!game_data.game_states.boss_flag ) {
                    console.log("Boss deactivated during phase movement delay, resolving early.");
                    resolve(); // Resolve the promise immediately if boss is inactive
                    return;
                }
                await movement_function(boss_data, movement_config);
                resolve();
            }, movement_config.timeout_ms); 
        });              
   
        current_boss_phase_index++; // Advance to the next phase in the sequence
       
            boss_phase_scheduler(boss_data); // Recursively call the scheduler for the next phase
        
    } else {
        console.error(`Boss movement function '${current_phase_plan.type}' not found for phase ${current_boss_phase_index}! Skipping to next phase.`);
        current_boss_phase_index++; // Advance to next phase to prevent infinite loop
       boss_phase_scheduler(boss_data); 
    }
}

/**
 * Generic helper function to execute a boss movement animation.
 * Handles validation, audio, and the animation completion.
 *
 * @param {object} boss_data - The boss data object.
 * @param {object} movement_config - The configuration object for this specific movement phase.
 * @param {string} function_name - The name of the calling boss_movement_X function for logging.
 * @param {function(boss_element): {x: number, y: number}} get_target_position - A function that returns the target {x, y} coordinates for the animation.
 * @param {function(): void} [pre_animation_setup] - Optional: A function to run unique setup before animation.
 * @returns {Promise<void>} A promise that resolves when the movement animation completes.
 */
function execute_boss_movement(boss_data, movement_config, function_name, get_target_position, pre_animation_setup = () => {}) {
    return new Promise(resolve_movement_phase => {
        const boss_element = validate_boss_for_movement(boss_data, function_name);
        if (boss_element === null) {
            resolve_movement_phase(); // Resolve immediately if validation fails
            return;
        }

        audio_play(movement_config.audio_key);

        pre_animation_setup(boss_element);

        // Get the target position from the specific movement function
        const target_pos = get_target_position(boss_element);

        // Execute the animation
        boss_element.animate({
            "left": target_pos.x,
            "top": target_pos.y
        }, movement_config.duration_ms, "linear", function () {
            boss_data.direction = null;
            // Update boss's bounding rectangle after animation
            boss_data.rect = boss_data.element[0].getBoundingClientRect();
            resolve_movement_phase(); // Resolve the Promise here
        });
    });
}

/**
 * Initiates and manages the first boss movement phase.
 * The boss moves to a central position.
 *
 * @param {object} boss_data - The boss data object.
 * @param {object} movement_config - The configuration object for this specific movement phase.
 * @returns {Promise<void>} A promise that resolves when the movement animation for this phase completes.
 */
function boss_movement_1(boss_data, movement_config) {
    boss_data.direction = movement_config.direction_2  || null;
    const get_target_position = (boss_element) => {
        const anim_poz_x = $(window).width() / 2 - boss_element.width() / 2;
        const anim_poz_y = movement_config.offset_y;
        return { x: anim_poz_x, y: anim_poz_y };
    };   

    return execute_boss_movement(boss_data, movement_config, "boss_movement_1", get_target_position);
}

/**
 * Manages the second phase of boss movement.
 * The boss moves to specific fixed coordinates.
 *
 * @param {object} boss_data - The boss data object.
 * @param {object} movement_config - The configuration object for this specific movement phase.
 * @returns {Promise<void>} A promise that resolves when the movement animation for this phase completes.
 */
function boss_movement_2(boss_data, movement_config) {
    boss_data.direction = movement_config.direction_2  || null;
    const get_target_position = (boss_element) => {
        const anim_poz_x = movement_config.final_x_poz;
        const anim_poz_y = movement_config.final_y_poz;
        return { x: anim_poz_x, y: anim_poz_y };
    };   

    return execute_boss_movement(boss_data, movement_config, "boss_movement_2", get_target_position);
}

/**
 * Manages the third phase of boss movement.
 * The boss moves to a central position after internal direction adjustment.
 *
 * @param {object} boss_data - The boss data object.
 * @param {object} movement_config - The configuration object for this specific movement phase.
 * @returns {Promise<void>} A promise that resolves when the movement animation for this phase completes.
 */
function boss_movement_3(boss_data, movement_config) {
    boss_data.direction = movement_config.direction_1  || null;
    const get_target_position = (boss_element) => {
        const anim_poz_x = $(window).width() / 2 - boss_element.width() / 2;
        const anim_poz_y = movement_config.offset_y;
        return { x: anim_poz_x, y: anim_poz_y };
    };   

    return execute_boss_movement(boss_data, movement_config, "boss_movement_3", get_target_position);
}

/**
 * Manages the fourth phase of boss movement.
 * The boss moves to a specific screen position (e.g., top-right corner).
 *
 * @param {object} boss_data - The boss data object.
 * @param {object} movement_config - The configuration object for this specific movement phase.
 * @returns {Promise<void>} A promise that resolves when the movement animation for this phase completes.
 */
function boss_movement_4(boss_data, movement_config) {
    boss_data.direction = movement_config.direction_1  || null;
    if (movement_config.direction_1) {
        boss_data.direction = movement_config.direction_1; 
    }
    const get_target_position = (boss_element) => {
        const anim_poz_x = $(window).width() - boss_element.width() - movement_config.anim_offset_x;
        const anim_poz_y = movement_config.anim_ofset_y;
        return { x: anim_poz_x, y: anim_poz_y };
    };
    
    return execute_boss_movement(boss_data, movement_config, "boss_movement_4", get_target_position);
}


/**
 * Validates the boss data and returns the boss element if valid.
 * Also checks if the boss is active and present in the DOM.
 *
 * @param {object} boss_data - The boss data object.
 * @param {string} function_name - The name of the calling function for logging purposes.
 * @returns {jQueryObject|null} The boss's jQuery element if valid and active, otherwise null.
 */
function validate_boss_for_movement(boss_data, function_name) {
    if (!boss_data || !boss_data.element) {
        console.warn(`Invalid Boss object data! Animation failed for ${function_name}!`);
        return null;
    }

    const boss_element = boss_data.element;

    if (boss_element.length === 0 || !game_data.game_states.boss_flag) {
        console.log(`Boss not active or element not found in DOM for ${function_name}. Skipping phase.`);
        return null;
    }

    return boss_element;
}