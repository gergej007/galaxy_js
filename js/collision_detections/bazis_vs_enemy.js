/**
 * Detects and handles collisions between player projectiles and enemy ships
 * using the spatial hash grid for optimization.
 * 
 * @function bazis_shots_enemy_collision_detection                       // Bazis Shot VS Enemy
 * @returns {void}
 * 
 * @description
 * 1. Iterates through active player shots.
 * 2. Queries SPATIAL_GRID for nearby ENEMY entities.
 * 3. Applies damage to enemies and handles projectile lifecycle (pooling/piercing).
 */
function bazis_shots_enemy_collision_detection() {
    const { PRIMARY_SHOT_TYPES, LAZER_TYPES } = COLLISION_CONFIG.WEAPON_TYPES;
    const { ENEMY } = COLLISION_CONFIG.ENTITY_TYPES;
    
    base_level_entities.bazis_shots.forEach(bazis_shot_data => {
        if (!bazis_shot_data.is_active || !PRIMARY_SHOT_TYPES.includes(bazis_shot_data.type)) {
            return;
        }

        if (!is_entity_valid(bazis_shot_data)) return;

        const bazis_shot_rect = bazis_shot_data.rect;
        const nearby_entities = SPATIAL_GRID.get_entities_in_rect(bazis_shot_rect);

        for (const entity of nearby_entities) {
            
            if (!bazis_shot_data.is_active) break;

            if (entity.type === ENEMY && entity.is_active) {   
                if (check_collision(bazis_shot_rect, entity.rect)) {
                    const is_lazer = LAZER_TYPES.includes(bazis_shot_data.type);

                    if (is_lazer) {
                        if (!bazis_shot_data.enemies_hit_ids.has(entity.id)) {
                            enemy_damage(entity, bazis_shot_data.damage);
                            bazis_shot_data.enemies_hit_ids.add(entity.id);
                        }
                        // Lazers continue the 'for...of' loop to hit other enemies in the same cell
                    } else {
                        enemy_damage(entity, bazis_shot_data.damage);
                        return_bazis_shot_to_pool(bazis_shot_data);
                        
                        break; 
                    }
                }
            }
        }
    });
}

/**
 * Detects and handles collisions between enemy projectiles and the player's base.
 * 
 * This function utilizes a spatial hash grid (Broad Phase) to quickly identify 
 * enemy shots in the immediate vicinity of the base before performing 
 * precise AABB collision checks (Narrow Phase).
 * 
 * @function bazis_enemy_shots_collision_detection                        // Bazis VS Enemy Shot
 * @returns {void}
 * 
 * @description
 * 1. Validates the existence of the player base (bazis).
 * 2. Queries the `SPATIAL_GRID` using the base's bounding rectangle.
 * 3. Filters discovered entities for active 'ENEMY_SHOT' types.
 * 4. On collision:
 *    - Triggers damage to the base via `bazis_damage`.
 *    - Recycles the projectile via `return_enemy_shot_to_pool`.
 * 
 * @see {@link check_collision} For the underlying AABB logic.
 * @see {@link SPATIAL_GRID#get_entities_in_rect} For the grid query implementation.
 */
function bazis_enemy_shots_collision_detection() {                         
    const bazis_data = base_level_entities.bazis;
    if (!is_entity_valid(bazis_data)) return;

    const { ENEMY_SHOT } = COLLISION_CONFIG.WEAPON_TYPES;
    const bazis_rect = bazis_data.rect;

    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(bazis_rect);

    for (const entity of nearby_entities) {
        if (entity.type === ENEMY_SHOT && entity.is_active) {
            
            if (check_collision(entity.rect, bazis_rect)) {

                bazis_damage(entity.damage, bazis_data);            
                return_enemy_shot_to_pool(entity);                
                
                 break; 
            }
        }
    }
}

/**
 * Manages physical collisions between the player's base and enemy ships.
 * 
 * Uses the spatial hash grid to retrieve enemy ships overlapping the base's area.
 * Upon collision, it triggers a "kick-back" animation for the base, destroys 
 * the enemy ship, and applies damage to the player's health.
 * 
 * @function bazis_enemy_collision_detection                        // Bazis VS Enemy
 * @returns {void}
 * 
 * @description
 * 1. Retrieves all entities currently in the grid cells occupied by the base.
 * 2. Filters for active 'ENEMY' ship types.
 * 3. On successful AABB collision:
 *    - Initiates base feedback movement via `bazis_feedback_moves`.
 *    - Destroys the ship via `explode_spacekraft`.
 *    - Reduces base health via `bazis_damage`.
 *    - Updates game score via `add_score_n_hit`.
 * 
 * @see {@link bazis_feedback_moves} For the collision physics animation.
 * @see {@link explode_spacekraft} For enemy destruction logic.
 */
function bazis_enemy_collision_detection() {
    const bazis_data = base_level_entities.bazis;
    if (!is_entity_valid(bazis_data)) return;

    const bazis_rect = bazis_data.rect;
    const { ENEMY } = COLLISION_CONFIG.ENTITY_TYPES;
    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(bazis_rect);

    for (const entity of nearby_entities) {
        if (entity.type === ENEMY && entity.is_active) {
            const entity_rect = entity.rect;

            if (check_collision(entity_rect, bazis_rect)) {   

                bazis_feedback_moves(entity_rect, bazis_data);                                                                
                explode_spacekraft(entity);           
                bazis_damage(entity.damage, bazis_data);           
                add_score_n_hit();
            }
        }
    }
}


/**
 * Detects and handles collisions between player projectiles and enemy projectiles.
 * 
 * This function iterates through active player shots and performs a spatial grid query 
 * to find intersecting enemy shots. It is used to simulate projectile neutralization 
 * or "clashing" effects.
 * 
 * @function bazis_shot_enemy_shot_collision_detection                  // Bazis Shot VS Enemy Shot
 * @returns {void}
 * 
 * @description
 * 1. Iterates through the active player projectile pool.
 * 2. Queries the `SPATIAL_GRID` for 'ENEMY_SHOT' entities in the immediate vicinity.
 * 3. Upon AABB collision:
 *    - Triggers a localized visual effect via `shots_explosion_lightning`.
 *    - Recycles the player projectile via `return_bazis_shot_to_pool`.
 *    - Recycles the enemy projectile via `return_enemy_shot_to_pool`.
 * 
 * @see {@link return_bazis_shot_to_pool} For player projectile recycling.
 * @see {@link return_enemy_shot_to_pool} For enemy projectile recycling.
 */
function bazis_shot_enemy_shot_collision_detection() {                    
    const { ENEMY_SHOT } = COLLISION_CONFIG.WEAPON_TYPES;

    base_level_entities.bazis_shots.forEach(bazis_shot_data => {

        if (!bazis_shot_data.is_active || !is_entity_valid(bazis_shot_data)) {
            return;
        }

        const bazis_shot_rect = bazis_shot_data.rect;
        const nearby_entities = SPATIAL_GRID.get_entities_in_rect(bazis_shot_rect);

        for (const entity of nearby_entities) {
            if (!bazis_shot_data.is_active) break;

            if (entity.type === ENEMY_SHOT && entity.is_active) {
                if (check_collision(bazis_shot_rect, entity.rect)) {
                    
                    shots_explosion_lightning(bazis_shot_rect.left, bazis_shot_rect.top);

                    return_bazis_shot_to_pool(bazis_shot_data);
                    return_enemy_shot_to_pool(entity);

                    break;
                }
            }
        }
    });   
}
