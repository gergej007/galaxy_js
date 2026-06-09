/**
 * Handles friendly-fire collisions between enemy projectiles and other enemy ships.
 * 
 * This logic is typically used for lower AI difficulty levels where enemies can 
 * accidentally damage their allies. It uses the spatial hash to efficiently 
 * find nearby enemies for every active enemy projectile.
 * prevent ships from being hit by their own projectiles.
 * 
 * @function enemy_shots_enemy_collision_detection
 * @returns {void}
 * 
 * @description
 * 1. Iterates through the active enemy projectile pool.
 * 2. Queries `SPATIAL_GRID` for nearby 'ENEMY' ships.
 * 3. Validates that the target is active and not the original shooter.
 * 4. On confirmed AABB collision:
 *    - Applies damage to the hit enemy via `enemy_damage`.
 *    - Recycles the projectile via `return_enemy_shot_to_pool`.
 * 
 * @see {@link enemy_damage} For enemy health reduction logic.
 * @see {@link return_enemy_shot_to_pool} For projectile recycling.
 */
function enemy_shots_enemy_collision_detection() {
    const { ENEMY } = COLLISION_CONFIG.ENTITY_TYPES;

    base_level_entities.enemy_shots.forEach(enemy_shot_data => {
        if (!enemy_shot_data.is_active || !is_entity_valid(enemy_shot_data)) {
            return;
        }

        const enemy_shot_rect = enemy_shot_data.rect;
        const nearby_entities = SPATIAL_GRID.get_entities_in_rect(enemy_shot_rect);

        for (const entity of nearby_entities) {
            if (!enemy_shot_data.is_active) break;

            if (entity.type === ENEMY && entity.is_active && entity.id !== enemy_shot_data.shooter_id) {
                
                if (check_collision(enemy_shot_rect, entity.rect)) {
                    enemy_damage(entity, enemy_shot_data.damage);
                    return_enemy_shot_to_pool(enemy_shot_data);
                    
                    break; 
                }
            }
        }
    });   
}

/**
 * Detects and handles rare mid-air collisions between two enemy ships.
 * 
 * Uses the spatial hash grid to identify overlapping enemies. To prevent 
 * self-destruction, the function compares entity IDs. Upon collision, 
 * both ships are destroyed via the explosion handler.
 * 
 * @function enemy_enemy_collision_detection
 * @returns {void}
 * 
 * @description
 * 1. Iterates through the enemy ship pool.
 * 2. Queries `SPATIAL_GRID` using the current ship's bounding box.
 * 3. Filters results for active enemies with a unique ID mismatch.
 * 4. On confirmed AABB collision:
 *    - Triggers `explode_spacekraft` for both participating entities.
 */
function enemy_enemy_collision_detection() {
    const{ENEMY} = COLLISION_CONFIG.ENTITY_TYPES;

    base_level_entities.enemy_ships.forEach( enemy_data =>{
        if(!enemy_data.is_active || !is_entity_valid(enemy_data)) return;

        const enemy_rect = enemy_data.rect;
        const nearby_entities = SPATIAL_GRID.get_entities_in_rect(enemy_rect);

        for (const entity of nearby_entities) {
            if (!enemy_data.is_active) break;
            if(enemy_data.id === entity.id) continue;

            if (entity.type === ENEMY && entity.is_active) {
                if (check_collision(enemy_rect, entity.rect)) {
                    explode_spacekraft(enemy_data);
                    explode_spacekraft(entity);
                    break;
                }
            }
        }
    })
}