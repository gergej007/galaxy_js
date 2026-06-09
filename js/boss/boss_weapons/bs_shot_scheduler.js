/**
 * Schedules a sequence of boss attacks based on a provided plan array.
 * 
 * This function acts as the central orchestrator for boss behavior during an active 
 * encounter. it clears existing attack timers to prevent overlapping sequences and 
 * maps specific attack types to their corresponding execution functions.
 * 
 * @function schedule_boss_attacks
 * @param {Object} boss_data - The state object for the boss entity.
 * @param {Array<number>} boss_data.attack_timeout_ids - An array of active setTimeout IDs.
 * @param {Array<Object>} attack_plans_array - A collection of attack configurations.
 * @param {string} attack_plans_array[].type - The attack identifier ('cone_shots', 'homing_shots', 'lazer_shots').
 * @param {number} attack_plans_array[].delay_ms - Delay in milliseconds before this specific attack fires.
 * @returns {void}
 * 
 * @description
 * 1. Validates boss data and timeout container existence.
 * 2. Clears all pending timers in `boss_data.attack_timeout_ids` to ensure a clean state.
 * 3. Iterates through the `attack_plans_array`:
 *    - Sets a `setTimeout` for each attack based on its `delay_ms`.
 *    - Inside the timer, checks `boss_flag` state before firing to prevent "ghost" attacks after death.
 *    - Switches logic based on the attack type to trigger specific shooting patterns.
 * 4. Stores new timer IDs back into `boss_data.attack_timeout_ids` for future cleanup.
 * 
 * @see {@link boss_cone_shooting} For the radial spread attack logic.
 * @see {@link boss_homing_shooting} For projectiles that target player coordinates.
 * @see {@link boss_lazer_shooting} For lingering beam attack logic.
 */
function schedule_boss_attacks(boss_data, attack_plans_array) {
    if (!boss_data || !boss_data.attack_timeout_ids) {
        console.warn("Boss data missing for scheduling attacks.");
        return;
    }

    // Clear any previous attack timeouts from this sequence
    if (boss_data.attack_timeout_ids.length > 0) {
        boss_data.attack_timeout_ids.forEach(id => clearTimeout(id));
        boss_data.attack_timeout_ids = [];
    }

    attack_plans_array.forEach(plan => {
      
        const timeout_id = setTimeout(() => {
            
            if (!game_data.game_states.boss_flag || !boss_data) {
                console.log("Boss deactivated during attack delay, cancelling fire.");
                return;
            }
           
            switch( plan.type) {
                case BOSS_ATTACK_TYPES.CONE : 
                    boss_cone_shooting( plan.shots, plan.spread_dist, plan.speed, plan.type_key, plan.audio);
                break;
                case BOSS_ATTACK_TYPES.HOMING : 
                    boss_homing_shooting(plan.shots, plan.speed, plan.audio, plan.interval_ms, plan.type_key);
                break;
                case BOSS_ATTACK_TYPES.LAZER : 
                    boss_lazer_shooting(plan.shots, plan.speed, plan.audio, plan.interval_ms, plan.type_key);
                break;
                default:
                    console.warn(`Unknown boss attack plan type: ${plan.type}`);
            }           
        }, plan.delay_ms);

        boss_data.attack_timeout_ids.push(timeout_id); // Store ID for potential clearing
    });
}      