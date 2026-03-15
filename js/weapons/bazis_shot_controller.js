function bazis_primary_shot_type_controller() {              // Primary weapons
    if( weapons.flags.standard_shot ){
        single_fire_shooting();
    }
    else if( weapons.flags.dual_fire_shot || game_data.game_states.boss_flag ){
        dual_fire_shooting();
    }
    else if( weapons.flags.single_lazer ){
        single_lazer_shooting();
    }
    else if( weapons.flags.dual_lazer ){
        dual_lazer_shooting();
    }    
}


/**
 * Handles common setup, shot limiting, and loop for firing bazis projectiles.
 *
 * @param {function(object, number): Promise<void>} launch_specific_shot_callback - A function that takes bazis_rect and iteration_index,
 *                                                                   and launches the specific type of shot. 
 * @param {number} [shots_per_burst=1] - How many shots are launched in one go (e.g., 1 for single, 2 for dual).
 */

async function fire_bazis_shots_orchestrator(launch_specific_shot_callback, shots_per_launch) {
   
    const bazis = base_level_entities.bazis;
    if (!bazis.element || $(bazis.element).length === 0) {
        console.warn("Bazis element not found for shooting.");
        return;                                                              
    }

    if (!bazis.rect) {
        console.warn("Bazis rect not initialized yet. Skipping shot.");
        return; 
    }

    const bazis_rect = bazis.rect; 

    // 3. Active Shots Count and Limit Check (adjusted for shots_per_burst)
    const MAX_ACTIVE_BAZIS_SHOTS = max_shots_ammount;     // From game_levels.js
    const active_bazis_shots_count = bazis_shot_pool.filter(shot_data => shot_data.is_active).length;

    // Check if enough slots are available for the next burst
    if (active_bazis_shots_count + shots_per_launch > MAX_ACTIVE_BAZIS_SHOTS) {
        console.log("Max bazis shots reached, wait.");
        return;
    }

    const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms)); // 4. timeout Promise Helper

    // 5. bazis_shot_repeat Loop Structure
    for (let i = 0; i < bazis_shot_repeat; i++) {
        // Execute the specific shot launching logic provided by the callback
        await launch_specific_shot_callback(bazis_rect, i); // Pass bazis_rect and loop index to callback

        await timeout(bazis_shot_timeout); 
    }
}
