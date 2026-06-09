/**
 * Detects and handles physical collisions between the player's base and bounty containers.
 * 
 * This function utilizes the spatial hash grid to identify bounty entities near the base.
 * On collision, it applies reciprocal damage to both the player base and the container, 
 * while triggering a physical "kick-back" visual effect.
 * 
 * @function bazis_container_collision                              // Container VS Bazis
 * @returns {void}
 * 
 * @description
 * 1. Validates the existence of the player base (bazis).
 * 2. Queries `SPATIAL_GRID` for 'BOUNTY' entities overlapping the base's rectangle.
 * 3. On confirmed AABB collision:
 *    - Triggers physics feedback via `bazis_feedback_moves`.
 *    - Applies damage to the container based on `bazis_data.damage` and a multiplier.
 *    - Applies damage to the base based on the specific `entity.damage`.
 * 
 * @see {@link bounty_container_damage} For the container's health reduction logic.
 * @see {@link bazis_feedback_moves} For the collision impact animation.
 */
function bazis_container_collision() {                                             
    const bazis_data = base_level_entities.bazis;

    if (!is_entity_valid(bazis_data)) {        
        return; 
    }
    const bazis_rect = bazis_data.rect;
    const { BOUNTY } = COLLISION_CONFIG.ENTITY_TYPES;
    const { BAZIS_DAMAGE_MULTIPLIER } = COLLISION_CONFIG; 

    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(bazis_rect);

    for (const entity of nearby_entities) {
        if (entity.type === BOUNTY && is_entity_valid(entity)) {
            const entity_rect = entity.rect;

            if (check_collision(entity_rect, bazis_rect)) {                  
                bazis_feedback_moves(entity_rect, bazis_data);

                bounty_container_damage(bazis_data.damage * BAZIS_DAMAGE_MULTIPLIER);       
                bazis_damage(entity.damage, bazis_data);
            }
        }
    }
}

/**
 * Detects and handles collisions between player projectiles and the bounty container.
 * 
 * Optimized for performance by querying the `SPATIAL_GRID` using the container's 
 * bounding area. This approach significantly reduces CPU overhead by only evaluating 
 * projectiles currently occupying the same grid cells as the container.
 * 
 * @function bazis_shots_container_collision_detection                  // Container VS Bazis shots
 * @returns {void}
 * 
 * @description
 * 1. Validates the existence of the bounty container.
 * 2. Retrieves a `Set` of entities from grid cells overlapping the container's `rect`.
 * 3. Filters discovered entities against allowed `PRIMARY_SHOT_TYPES`.
 * 4. On confirmed AABB collision:
 *    - Applies damage to the container based on the projectile's damage value.
 *    - Recycles the projectile via `return_bazis_shot_to_pool`.
 * 
 * @see {@link bounty_container_damage} For the container's damage response.
 * @see {@link SPATIAL_GRID#get_entities_in_rect} For the broad-phase query logic.
 */
function bazis_shots_container_collision_detection() {                     
    const bounty_data = base_level_entities.bounty;
    if (!is_entity_valid(bounty_data)) return;

    const { PRIMARY_SHOT_TYPES } = COLLISION_CONFIG.WEAPON_TYPES;

    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(bounty_data.rect);

    for (const entity of nearby_entities) {
        if (!entity.is_active || !PRIMARY_SHOT_TYPES.includes(entity.type) || !is_entity_valid(entity)) {
            continue;
        }

        if (check_collision(entity.rect, bounty_data.rect)) {
            bounty_container_damage(entity.damage);
            return_bazis_shot_to_pool(entity);
        }
    }
}

/**
 * Handles the absorption of enemy projectiles by the bounty container.
 * 
 * This function treats the bounty container as a physical obstacle. It queries the 
 * spatial hash for enemy shots overlapping the container's bounds and neutralizes 
 * them upon impact, preventing projectiles from passing through the container.
 * 
 * @function enemy_shots_container_collision_detection                  //  Container catch enemy shots
 * @returns {void}
 * 
 * @description
 * 1. Validates the current existence of the bounty container.
 * 2. Queries the `SPATIAL_GRID` for all entities within the container's area.
 * 3. Filters for active 'ENEMY_SHOT' types.
 * 4. On confirmed AABB collision:
 *    - Recycles the enemy projectile via `return_enemy_shot_to_pool`.
 * 
 * @see {@link SPATIAL_GRID#get_entities_in_rect} For the broad-phase neighbor lookup.
 * @see {@link return_enemy_shot_to_pool} For the projectile recycling mechanism.
 */
function enemy_shots_container_collision_detection() {                         
    const bounty_data = base_level_entities.bounty;    
    if (!is_entity_valid(bounty_data)) return;

    const { ENEMY_SHOT } = COLLISION_CONFIG.WEAPON_TYPES;
    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(bounty_data.rect);

    for (const entity of nearby_entities) {
        if (entity.type === ENEMY_SHOT && entity.is_active) {
            
            if (check_collision(entity.rect, bounty_data.rect)) {
                return_enemy_shot_to_pool(entity);
            }
        }
    }
}

/**
 * Handles the collection of power-up items by the player base.
 * 
 * Optimized by querying the `SPATIAL_GRID` using the power-up's bounding area to find 
 * the player base. This ensures the collision logic only executes when a power-up 
 * is physically present on the screen.
 * 
 * @function bazis_powerup_collision_detection                  // PowerUp vs Bazis
 * @returns {void}
 * 
 * @description
 * 1. Checks for the existence of an active power-up entity.
 * 2. Queries the `SPATIAL_GRID` for entities overlapping the power-up's `rect`.
 * 3. Filters discovered entities for the 'BAZIS' type.
 * 4. On confirmed AABB collision:
 *    - Triggers the power-up collection logic via `pick_up_powerup`.
 * 
 * @see {@link pick_up_powerup} For the logic that applies the power-up effects to the player.
 * @see {@link SPATIAL_GRID#get_entities_in_rect} For the localized broad-phase lookup.
 */
function bazis_powerup_collision_detection() {                                    
    const { BAZIS } = COLLISION_CONFIG.ENTITY_TYPES;
    const powerup_data = base_level_entities.powerup;
    
    if (!is_entity_valid(powerup_data)) return;

    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(powerup_data.rect);

    for (const entity of nearby_entities) {
        if (entity.type === BAZIS && is_entity_valid(entity)) {
            if (check_collision(entity.rect, powerup_data.rect)) {                                                                    
                pick_up_powerup(powerup_data);                
                break;
            } 
        }
    }
}
