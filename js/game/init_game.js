/**
 * Follows a strict Update -> Hash -> Interact pattern,as the industry standard for 2D game engines.
 * Main game loop orchestrator. Synchronizes input, entity positions, 
 * spatial grid updates, and collision detection using RequestAnimationFrame.
 * @param {number} timestamp - Current high-resolution timestamp provided by the browser.
 */
function primary_game_loop(timestamp) {
    const dt = calculate_delta_time(timestamp);
    
    //  Update 
    process_player_input(dt);
    update_all_entity_positions(); 
    //  Hash
    rebuild_spatial_hash();

    //  Interaction  
    handle_active_collisions();

    requestAnimationFrame(primary_game_loop);
}

/**
 * Iterates through active entity pools to update their physical 
 * bounding boxes (rects) based on current DOM positions.
 */
function update_all_entity_positions() {
    update_base_entity_rects();

    if (game_data.game_states.boss_flag) {
        update_boss_entity_rects();  
    }
}

/**
 * Dispatches collision detection tasks to specialized handlers 
 * based on the current game state flags.
 */
function handle_active_collisions() {
    if (game_data.game_states.traffic_flag) {
        handle_base_level_collisions();
    }
    
    if (game_data.game_states.bounty_flag) {
        handle_bounty_system_collisions();
    }

    if (game_data.game_states.boss_flag) {
        handle_boss_level_collisions();
    }
}

/**
 * Orchestrates all collision detection logic for the base game level.
 * Handles interactions between the player (Bazis), standard enemies, and their respective projectiles.
 * Includes a conditional check for enemy-on-enemy projectile hits based on current level AI.
 */
function handle_base_level_collisions() {
    bazis_enemy_shots_collision_detection();
    bazis_enemy_collision_detection();
    bazis_shot_enemy_shot_collision_detection();
    bazis_shots_enemy_collision_detection();
    enemy_enemy_collision_detection();
    if (game_data.levels.act_level < GAME_CONSTANTS.ENEMY_AI_LEVEL) {
        enemy_shots_enemy_collision_detection();
    }
}

/**
 * Manages collision detection for the bounty system.
 * Handles interactions between the player (Bazis), enemies, and containers, 
 * as well as powerup collection by the player.
 */
function handle_bounty_system_collisions() {
    bazis_container_collision();
    enemy_shots_container_collision_detection();
    bazis_shots_container_collision_detection();
    bazis_powerup_collision_detection();
}

/**
 * Orchestrates all collision detection logic for the boss encounter.
 * Handles interactions between the player (Bazis), the boss, their respective projectiles,
 * and environmental hazards like asteroids.
 */
function handle_boss_level_collisions() {
    bazis_shots_boss_collision_detection();
    boss_shots_bazis_collision_detection();
    boss_bazis_collision_detection();
    boss_shot_bazis_shot_collision_detection();

    asteroid_bazis_collision_detection();
    asteroid_bazis_shots_collision_detection();
    asteroid_boss_shots_collision_detection();
}


