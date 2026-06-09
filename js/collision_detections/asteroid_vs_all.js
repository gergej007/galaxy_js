/**
 * Detects and handles physical impacts between the boss asteroid and the player base.
 * 
 * Uses the spatial hash grid to identify if the player base (BAZIS) is within 
 * the asteroid's local cells. If a collision is confirmed, it triggers 
 * displacement physics (kick-back) for the player base.
 * 
 * @function asteroid_bazis_collision_detection                         // Asteroid VS Bazis
 * @returns {void}
 * 
 * @description
 * 1. Validates the existence of both the asteroid and the player base.
 * 2. Queries the `SPATIAL_GRID` using the asteroid's current bounding box.
 * 3. Filters discovered entities for the 'BAZIS' type.
 * 4. On confirmed AABB collision:
 *    - Triggers a physics-based feedback move via `bazis_feedback_moves`.
 * 
 * @see {@link bazis_feedback_moves} For the logic governing the base's reactive movement.
 * @see {@link SPATIAL_GRID#get_entities_in_rect} For the broad-phase query logic.
 */
function asteroid_bazis_collision_detection() {
    // ... logic
}

function asteroid_bazis_collision_detection() {                                       
    const { BAZIS } = COLLISION_CONFIG.ENTITY_TYPES;
    const bazis_data = base_level_entities.bazis;
    const asteroid_data = boss_level_entities.asteroid;

    if (!is_entity_valid(asteroid_data) || !is_entity_valid(bazis_data)) 
        return;    

    const asteroid_rect = asteroid_data.rect;  
    
    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(asteroid_rect);
        for( const entity of nearby_entities){
        if( entity.type === BAZIS && is_entity_valid(entity)){
          if( check_collision(asteroid_rect, entity.rect)){
            bazis_feedback_moves(asteroid_rect, entity);
          }
    }
}
}
/**
 * Handles collisions between player projectiles and the boss-level asteroid.
 * 
 * This function utilizes the spatial hash grid to efficiently find player shots 
 * intersecting with the asteroid's area. When a collision is confirmed, it 
 * triggers a visual particle effect and recycles the projectile.
 * 
 * @function asteroid_bazis_shots_collision_detection                       // Asteroid VS Bazis Shots
 * @returns {void}
 * 
 * @description
 * 1. Validates that the asteroid is currently active/valid.
 * 2. Queries the `SPATIAL_GRID` using the asteroid's current `rect`.
 * 3. Filters discovered entities against allowed `PRIMARY_SHOT_TYPES` and active states.
 * 4. On confirmed AABB collision:
 *    - Triggers a visual dust effect via `dust_animation`.
 *    - Recycles the player projectile via `return_bazis_shot_to_pool`.
 * 
 * @see {@link dust_animation} For the particle effect logic.
 * @see {@link SPATIAL_GRID#get_entities_in_rect} For the broad-phase neighbor lookup.
 */
function asteroid_bazis_shots_collision_detection() {
    const asteroid_data = boss_level_entities.asteroid;
    if (!is_entity_valid(asteroid_data)) return;

    const { PRIMARY_SHOT_TYPES } = COLLISION_CONFIG.WEAPON_TYPES;
    const asteroid_rect = asteroid_data.rect;
    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(asteroid_rect);

    for (const entity of nearby_entities) {
        if (!PRIMARY_SHOT_TYPES.includes(entity.type) || !entity.is_active) {
            continue;
        }

        if (check_collision(asteroid_rect, entity.rect)) {
            dust_animation(entity, asteroid_rect); 
            return_bazis_shot_to_pool(entity);
            
        }
    }
}
  

/**
 * Manages collisions between the boss-level asteroid and projectiles fired by the Boss.
 * 
 * This function treats the asteroid as a physical shield. It queries the spatial hash 
 * to find Boss projectiles intersecting the asteroid's area. Standard projectiles 
 * are recycled, while lingering laser types are flagged to terminate their lifecycle.
 * 
 * @function asteroid_boss_shots_collision_detection                   // Asteroid VS Boss Shots
 * @returns {void}
 * 
 * @description
 * 1. Validates the existence of the asteroid entity.
 * 2. Queries the `SPATIAL_GRID` using the asteroid's bounding box.
 * 3. Filters discovered entities for active 'BOSS_SHOT_TYPES'.
 * 4. On confirmed AABB collision:
 *    - Triggers visual dust particles via `dust_animation`.
 *    - If the shot is a lingering/laser type (e.g., 'Boss Twin Lazer'):
 *        - Sets `has_hit` to true and deactivates the entity.
 *    - Otherwise:
 *        - Recycles the projectile via `return_boss_shot_to_pool`.
 * 
 * @see {@link dust_animation} For the collision visual effect.
 * @see {@link return_boss_shot_to_pool} For boss projectile recycling.
 */
function asteroid_boss_shots_collision_detection(){                                  
    const {BOSS_SHOT_TYPES} = COLLISION_CONFIG.WEAPON_TYPES;
    const {BOSS_LAZER_SHOT} = COLLISION_CONFIG.WEAPON_TYPES;
    const asteroid_data = boss_level_entities.asteroid;
    if (!is_entity_valid(asteroid_data)) return;
   
    const asteroid_rect = asteroid_data.rect;
    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(asteroid_rect);

    for(const entity of nearby_entities){
        if (!BOSS_SHOT_TYPES.includes(entity.type) || !entity.is_active) {
            continue;
        }
        if( check_collision( asteroid_rect, entity.rect)){
            dust_animation(entity, asteroid_rect);
            if (!BOSS_SHOT_TYPES.includes(entity.type) || !entity.is_active) continue;
            if (entity.type === BOSS_LAZER_SHOT) {
                entity.has_hit = true; 
                entity.is_active = false; 
            }
            else {
               return_boss_shot_to_pool(entity); 
            }
        }
    }   
}
