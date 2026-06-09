/**
 * Initiates the boss's death sequence when its HP falls below 1.
 * This function performs several critical actions to transition the game state
 * from active boss fight to boss defeated, including:
 * - Activating player invincibility (god mode).
 * - Triggering visual and audio effects for the boss's destruction.
 * - Stopping all boss movement and clearing its scheduled actions.
 * - Cleaning up all active projectiles from both the player and the boss.
 * - Exploding asteroid. 
 * - Updating the game score and displaying relevant UI changes.
 * - Preparing the game state for potential level transition or win condition.
 *
 * @returns {void}
 */                    

function boss_dies() {  
    weapons.flags.god_mode = true;    
    score_dependent_fns();

    const { ANIM_DURATION, BOSS_KILLED_SCORE, SCREEN_SHAKE_DURATION, LAZER_SOUND } = BOSS_DIES_CONFIG;

    audio_stop(LAZER_SOUND);
    const boss_data = boss_level_entities.boss;
    if (!is_entity_valid(boss_data)) return;

    const boss_element = validate_boss_for_movement(boss_data, "boss_dies");
    
    // Sequence Execution
    boss_dies_main_explosion(boss_data.rect);
    boss_dies_side_explosion(boss_data.rect);
    trigger_screen_shake(0, SCREEN_SHAKE_DURATION);

    game_data.game_states.boss_flag = false;
    send_all_projectiles_back();

    boss_element.stop(true, false).animate({ "opacity": 0 }, ANIM_DURATION, function() {
        $(this).remove();
    });    

    // State Updates
    boss_data.attack_timeout_ids = null;
    game_data.counters.killed++;
    game_data.counters.score += BOSS_KILLED_SCORE;
    
    update_right_display();
    bazis_exit();
    remove_asteroid(); 
    play_boss_dies_sfx();
}

/**
 * Iterates through active projectile pools (Bazis and Boss) and returns
 * all active shots to their respective object pools for reuse.
 */
function send_all_projectiles_back() {
    const pools = [base_level_entities.bazis_shots, boss_level_entities.boss_shots];
    pools.forEach(pool => {
        pool.filter(shot => shot.is_active)
            .forEach(shot => {
                const return_fn = pool === base_level_entities.bazis_shots 
                    ? return_bazis_shot_to_pool                             
                    : return_boss_shot_to_pool;
                return_fn(shot);
            });
    });
}

/**
 * Plays the sequential sound effects for the boss's destruction 
 * with a configured delay between the initial and secondary audio clips.
 */
function play_boss_dies_sfx() {
    const { DELAY_AUDIO, AUDIO_KEYS } = BOSS_DIES_CONFIG;
    audio_play(AUDIO_KEYS[0]);
    setTimeout(() => audio_play(AUDIO_KEYS[1]), DELAY_AUDIO);
}

/**
 * Validates and destroys the active asteroid entity.
 * Triggers an explosion effect and removes the asteroid from the game world.
 */
function remove_asteroid() {
    const asteroid_data = boss_level_entities.asteroid;
    if( is_entity_valid(asteroid_data )){
       explode_spacekraft(asteroid_data);                                                             
    }
}
