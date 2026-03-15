
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

    // --- Access the top-level configuration objects from BOSS_BEHAVIOR_CONFIG ---   
    const { MOVEMENT_PHASES, PHASE_SEQUENCE } = BOSS_BEHAVIOR_CONFIG; 

    // --- Determine the current phase plan from the sequence ---
    // If all phases completed, loop back to the start
    if (current_boss_phase_index >= PHASE_SEQUENCE.length) {
        current_boss_phase_index = 0; // Reset index to loop the phase sequence
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
            // Update boss's bounding rectangle after animation
            boss_data.rect = boss_data.element[0].getBoundingClientRect();
            resolve_movement_phase(); // Resolve the Promise here!
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
    const get_target_position = (boss_element) => {
        const anim_poz_x = $(window).width() / 2 - boss_element.width() / 2;
        const anim_poz_y = movement_config.offset_y;
        return { x: anim_poz_x, y: anim_poz_y };
    };

    const pre_animation_setup = (boss_element) => {
        // Set direction here if it's meant to be set when movement *starts*
        if (movement_config.direction_2) {
            boss_data.direction = movement_config.direction_2;
        }
    };

    return execute_boss_movement(boss_data, movement_config, "boss_movement_1", get_target_position, pre_animation_setup);
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
    const get_target_position = (boss_element) => {
        const anim_poz_x = $(window).width() / 2 - boss_element.width() / 2;
        const anim_poz_y = movement_config.offset_y;
        return { x: anim_poz_x, y: anim_poz_y };
    };

    const pre_animation_setup = (boss_element) => {
        // Apply internal direction change (if any)
        if (boss_data.direction === movement_config.direction_1) {
            boss_data.direction = null; 
        }
        boss_data.direction = movement_config.direction_1;
    };

    return execute_boss_movement(boss_data, movement_config, "boss_movement_3", get_target_position, pre_animation_setup);
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
    const get_target_position = (boss_element) => {
        const anim_poz_x = $(window).width() - boss_element.width() - movement_config.anim_offset_x;
        const anim_poz_y = movement_config.anim_ofset_y;
        return { x: anim_poz_x, y: anim_poz_y };
    };

    return execute_boss_movement(boss_data, movement_config, "boss_movement_4", get_target_position);
}

// /**
//  * Initiates and manages the first boss movement phase.
//  * This function handles the boss's animation to a target position and
//  *
//  * @param {object} boss_data - The boss data object.
//  * @param {object} movement_config - The configuration object for this specific movement phase.
//  * @returns {Promise<void>} A promise that resolves when the movement animation for this phase completes.
//  */
// function boss_movement_1(boss_data, movement_config) {
//     return new Promise(resolve_movement_phase => { 
//         const boss_element = validate_boss_for_movement(boss_data, "boss_movement_1");
//         if (boss_element === null) {
          
//             resolve_movement_phase(); // Resolve immediately if validation fails
//             return;
//         }     
       
//         audio_play(movement_config.audio_key); 

//         // --- Phase 1 Movement: Move to Center (after timeout_ms delay) ---
//         const anim_poz_x = $(window).width() / 2 - boss_element.width() / 2;
//         const anim_poz_y = movement_config.offset_y;       

//             boss_element.animate({
//                 "left": anim_poz_x,
//                 "top": anim_poz_y
//             }, movement_config.duration_ms, "linear", function () {
//                 boss_data.movement_timeout_id = null; // Clear ID on completion
//                 resolve_movement_phase(); // Movement animation for this phase is done.
//             });
//             // Set direction here if it's meant to be set when movement *starts*
//             boss_data.direction = movement_config.direction_2;
//     });
// }

// /**
//  * Manages the second phase of boss movement.
//  * The boss moves to a specific screen position (e.g., top-left corner),
//  * potentially after an initial delay, and resolves its promise when movement completes.
//  *
//  * @param {object} boss_data - The data object for the boss.
//  * @param {object} movement_config - The configuration object for this specific movement phase (e.g., MOVEMENT_2).
//  * @returns {Promise<void>} A promise that resolves when the movement animation for this phase completes.
//  */
// function boss_movement_2(boss_data, movement_config) {
//     return new Promise(resolve_movement_phase => { 
//         const boss_element = validate_boss_for_movement(boss_data, "boss_movement_2");
//         if (boss_element === null) {
          
//             resolve_movement_phase(); // Resolve immediately if validation fails
//             return;
//         }       

//             audio_play(movement_config.audio_key); 

//             boss_element.animate({
//                 "left": movement_config.final_x_poz, // Use config value (30)
//                 "top": movement_config.final_y_poz   // Use config value (30)
//             }, movement_config.duration_ms, "linear", function () { // Use config duration (2500)
//                 boss_data.movement_timeout_id = null; // Clear ID on completion
//                 resolve_movement_phase(); // Resolve the Promise here! The movement is done.
//             });
//     });
// }

// /**
//  * Manages the third phase of boss movement.
//  * The boss performs a sequence of attacks, then moves to a central position
//  * after an initial delay, and resolves its promise upon movement completion.
//  *
//  * @param {object} boss_data - The data object for the boss.
//  * @param {object} movement_config - The configuration object for this specific movement phase (e.g., MOVEMENT_3).
//  * @returns {Promise<void>} A promise that resolves when the movement animation for this phase completes.
//  */
// function boss_movement_3(boss_data, movement_config) {
//     return new Promise(resolve_movement_phase => {
//         const boss_element = validate_boss_for_movement(boss_data, "boss_movement_3");
//         if (boss_element === null) {
          
//             resolve_movement_phase(); // Resolve immediately if validation fails
//             return;
//         }
     
//         audio_play(movement_config.audio_key); // Use audio_key from config
      
//         if (boss_data.direction === movement_config.direction_1) { // e.g., "moving_right"
//             boss_data.direction = null;
//         }

//         // Calculate target position using config (if final_x/y_poz are percentages or offsets, adjust here)
//         const anim_poz_x = $(window).width() / 2 - boss_element.width() / 2; // Central horizontal
//         const anim_poz_y = movement_config.offset_y; // e.g., 90

//             boss_element.animate({
//                 "left": anim_poz_x,
//                 "top": anim_poz_y
//             }, movement_config.duration_ms, "linear", function () { // Use duration_ms from config
//                 // This callback fires when the animation for THIS movement completes.
//                 boss_data.rect = boss_data.element[0].getBoundingClientRect(); // Update rect
//                 boss_data.movement_timeout_id = null; // Clear ID on completion
//                 resolve_movement_phase(); // Resolve the Promise here! The movement is done.
//             });
//             // Set direction here if it's meant to be set when movement *starts*
//             boss_data.direction = movement_config.direction_1; 
//     });
// }

// /**
//  * Manages the fourth phase of boss movement.
//  * This phase typically moves the boss to a final corner or side position,
//  * potentially after an initial delay, and resolves its promise upon movement completion.
//  *
//  * @param {object} boss_data - The boss data object.
//  * @param {object} movement_config - The configuration object for this specific movement phase (e.g., MOVEMENT_4).
//  * @returns {Promise<void>} A promise that resolves when the movement animation for this phase completes.
//  */
// function boss_movement_4(boss_data, movement_config) {
//     return new Promise(resolve_movement_phase => { 
//         const boss_element = validate_boss_for_movement(boss_data, "boss_movement_4");
//         if (boss_element === null) {           
//             resolve_movement_phase(); // Resolve immediately if validation fails
//             return;
//         }
     
//         audio_play(movement_config.audio_key); 
       
//         const anim_poz_x = $(window).width() - boss_element.width() - movement_config.anim_offset_x; // Use anim_offset_x (30)
//         const anim_poz_y = movement_config.anim_ofset_y; // Use anim_ofset_y (40)

//             boss_element.animate({
//                 "top": anim_poz_y,
//                 "left": anim_poz_x
//             }, movement_config.duration_ms, "linear", // Use duration_ms from config (2500)
//                 function () {
//                     // This callback fires when the animation for THIS movement completes.
//                     boss_data.rect = boss_data.element[0].getBoundingClientRect(); // Update rect
//                     boss_data.movement_timeout_id = null; // Clear ID on completion
//                     resolve_movement_phase(); // Resolve the Promise here! The movement is done.
//                 });
//     });
// }

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