/**
 * Orchestrates the removal of all active entities from the game world.
 * Iterates through entity pools to stop animations and reset states using 
 * established return-to-pool helpers, then clears the spatial hash grid.
 * 
 * @returns {void}
 */
function cleanup_entities() {
    const pools = [
        { data: base_level_entities.bazis_shots, return_fn: return_bazis_shot_to_pool },
        { data: base_level_entities.enemy_ships, return_fn: return_enemy_to_pool },
        { data: base_level_entities.enemy_shots, return_fn: return_enemy_shot_to_pool },
        { data: boss_level_entities.boss_shots,  return_fn: return_boss_shot_to_pool },
        { data: base_level_entities.homing_missiles, return_fn: return_homing_missile_to_pool},
        { data: base_level_entities.tracking_lazers, return_fn: return_tracking_lazer_to_pool}
    ];

    pools.forEach(pool => {
        pool.data.forEach(entity => {
            if (entity.is_active) {
                pool.return_fn(entity);
            }
        });
    });

    SPATIAL_GRID.clear();
}

/**
 * Terminates all scheduled asynchronous tasks and active visual transitions.
 * Clears weapon system timeouts and halts all ongoing jQuery animations 
 * to ensure a clean break between game sessions.
 * 
 * @returns {void}
 */
function clear_all_active_timers() {
    // Clear weapon schedulers
    if(homing_missile_timeout) {
        clearTimeout(homing_missile_timeout);
        homing_missile_timeout = null;
    }
    if (tracking_lazer_timeout) {
        clearTimeout(tracking_lazer_timeout);
        tracking_lazer_timeout = null;
    }    
    
    $("*").stop(true, true);
}

/**
 * Resets core game progression, player stats, and weapon states to their initial values.
 * Re-synchronizes the user interface displays to reflect the cleared game state.
 * 
 * @returns {void}
 */
function reset_logic_data() {
    game_data.counters.score = 0;
    game_data.counters.killed = 0;
    game_data.levels.act_level = 1;
    
    weapons.flags.god_mode = false;
    weapons.flags.tracking_lazer = false;
    weapons.flags.dual_fire_shot = false;
    weapons.flags.dual_lazer = false;
    weapons.flags.homing_missile = false;
    weapons.flags.single_lazer = false;
    
    update_left_display();
    update_right_display();
}