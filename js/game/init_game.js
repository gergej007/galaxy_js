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
    const bazis = base_level_entities.bazis;
    if (is_entity_valid(bazis)) {
        // Broad Phase: Find everyone near the player
        const nearby = SPATIAL_GRID.get_entities_in_rect(bazis.rect);
        
        // Narrow Phase: Handle damage, crashes, and powerups
        resolve_bazis_interactions(bazis, nearby);
    }
    dispatch_collisions(base_level_entities.bazis_shots, resolve_bazis_shot_interactions);

    if (game_data.game_states.traffic_flag ) {
        dispatch_collisions(base_level_entities.enemy_shots, resolve_enemy_shot_interactions);
        dispatch_collisions(base_level_entities.enemy_ships, resolve_enemy_ship_interactions);
    }    

    if (game_data.game_states.boss_flag) {
        dispatch_collisions(boss_level_entities.boss_shots, resolve_boss_shot_interactions);
    }
}
