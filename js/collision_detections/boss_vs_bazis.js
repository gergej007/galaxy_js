/**
 * Processes collisions between player projectiles and the boss entity.
 * 
 * This function optimizes detection by querying the `SPATIAL_GRID` using the boss's 
 * bounding area. It distinguishes between standard projectiles, which are recycled 
 * on impact, and laser types, which utilize piercing logic to prevent multiple 
 * damage triggers from the same beam in a single frame.
 * 
 * @function bazis_shots_boss_collision_detection                       // Bazis shot VS Boss
  
 * @returns {void}
 * 
 * @description
 * 1. Validates the existence of the boss entity.
 * 2. Queries the `SPATIAL_GRID` using the boss's current `rect`.
 * 3. Filters discovered entities for active player shots defined in `PRIMARY_SHOT_TYPES`.
 * 4. On confirmed AABB collision.
 * 
 * @see {@link boss_damage} For the boss health reduction and feedback logic.
 * @see {@link return_bazis_shot_to_pool} For player projectile recycling.
 * @see {@link SPATIAL_GRID#get_entities_in_rect} For the broad-phase query logic.
 */
function bazis_shots_boss_collision_detection() {                                 
    const boss_data = boss_level_entities.boss;
    if ( !is_entity_valid(boss_data)) {        
        return; 
    }

    const {PRIMARY_SHOT_TYPES} = COLLISION_CONFIG.WEAPON_TYPES;
    const boss_rect = boss_data.rect;  
    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(boss_rect);

    for(const entity of nearby_entities) {
        if (!PRIMARY_SHOT_TYPES.includes(entity.type) || !entity.is_active) {  
            continue;
        } 

        if( check_collision( entity.rect, boss_rect))
            {           
                boss_damage( entity, boss_data, entity.damage );     
                return_bazis_shot_to_pool(entity);
            }
    }   
}

/**
 * Detects and handles collisions between boss projectiles and the player base.
 * 
 * This function utilizes the spatial hash grid to efficiently find boss shots 
 * intersecting with the player's area. It ensures that every projectile hitting 
 * the base in a single frame applies damage before being recycled.
 * 
 * @function boss_shots_bazis_collision_detection
 * @returns {void}
 * 
 * @description
 * 1. Validates the player base entity.
 * 2. Queries the `SPATIAL_GRID` using the base's bounding box.
 * 3. Filters discovered entities for active 'BOSS_SHOT_TYPES'.
 * 4. On confirmed AABB collision:
 *    - Reduces base health .
 *    - Recycles the boss projectile .
 */
function boss_shots_bazis_collision_detection() {                                // Boss shot VS Bazis
    const bazis_data = base_level_entities.bazis;
    
    if ( !is_entity_valid(bazis_data)) {        
        return; 
    }

    const {BOSS_SHOT_TYPES} = COLLISION_CONFIG.WEAPON_TYPES;
    const bazis_rect = bazis_data.rect;
    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(bazis_rect);

    for(const entity of nearby_entities) {
        if (!BOSS_SHOT_TYPES.includes(entity.type) || !entity.is_active) {
            continue;
        }
        if( check_collision( bazis_rect, entity.rect))
            {           
                return_boss_shot_to_pool( entity);           
                bazis_damage(entity.damage, bazis_data); 
            }
    }   
}


/**
 * Detects and handles the specialized EMP proximity attack from the Boss to the Player Base.
 * 
 * Unlike standard AABB collisions, this uses an expanded "Strike Zone" configuration 
 * to trigger a screen-shake effect and EMP-style damage when the Boss is near the base.
 * Includes a cooldown mechanism to prevent damage-per-frame spam.
 * 
 * @function boss_bazis_collision_detection                                      // Boss VS Bazis
 * @returns {void}
 */
function boss_bazis_collision_detection() {
    const bazis_data = base_level_entities.bazis;
    const boss_data = boss_level_entities.boss;
    
    if (!is_entity_valid(bazis_data) || !is_entity_valid(boss_data)) return;

    const { EMP_STRIKE_ZONE_X_PX, EMP_STRIKE_ZONE_Y_PX, EMP_COOLDOWN_MS } = COLLISION_CONFIG;
    const { BOSS } = COLLISION_CONFIG.ENTITY_TYPES;

    const bazis_rect = bazis_data.rect;
    const nearby_entities = SPATIAL_GRID.get_entities_in_rect(bazis_rect);

    for (const entity of nearby_entities) {
        if (entity.type !== BOSS || !is_entity_valid(entity)) {
            continue; 
        }

        const entity_rect = entity.rect;

        const is_in_emp_range = 
            bazis_rect.right > entity_rect.left - EMP_STRIKE_ZONE_X_PX &&
            bazis_rect.left < entity_rect.right + EMP_STRIKE_ZONE_X_PX &&
            bazis_rect.top < entity_rect.bottom + EMP_STRIKE_ZONE_Y_PX &&
            bazis_rect.bottom > entity_rect.top;

        if (is_in_emp_range) {
            const now = Date.now();
            // Handle Cooldown
            if (!weapons.emp_timeout || now - weapons.emp_timeout > EMP_COOLDOWN_MS) {
                weapons.emp_timeout = now;
                boss_emp_shake(entity, bazis_data); 
                bazis_damage(entity.damage, bazis_data);   
            }          
        }   
    }    
}


/**
 * Processes neutralizing collisions between player projectiles and boss projectiles.
 * 
 * This function handles the "clashing" of shots in mid-air. It iterates through 
 * active player projectiles and queries the spatial hash for boss projectiles 
 * in the immediate vicinity to trigger mutual destruction.
 * 
 * @function boss_shot_bazis_shot_collision_detection                      // Boss shot VS  Bazis shot
 * @returns {void}
 * 
 * @description
 * 1. Iterates through the player projectile pool.
 * 2. Queries `SPATIAL_GRID` using each player shot's bounding box.
 * 3. On confirmed AABB collision with a 'BOSS_SHOT_TYPE':
 *    - Triggers visual feedback via `shots_explosion_lightning`.
 *    - Recycles both projectiles via their respective pooling functions.
 */                                                         
function boss_shot_bazis_shot_collision_detection() {                              
    const { BOSS_SHOT_TYPES } = COLLISION_CONFIG.WEAPON_TYPES;                                                              
    
    base_level_entities.bazis_shots.filter(bazis_shot_data => bazis_shot_data.is_active)
    .forEach(bazis_shot_data => {

        if (!is_entity_valid(bazis_shot_data)) return; 
        
        const bazis_shot_rect = bazis_shot_data.rect;
        const nearby_entities = SPATIAL_GRID.get_entities_in_rect(bazis_shot_rect);

        for (const entity of nearby_entities) {
            if (!bazis_shot_data.is_active) break;

            if (BOSS_SHOT_TYPES.includes(entity.type) && entity.is_active) {                
                if (check_collision(bazis_shot_rect, entity.rect)) {
                    shots_explosion_lightning(bazis_shot_rect.left, bazis_shot_rect.top);
                    
                    return_bazis_shot_to_pool(bazis_shot_data);

                    // Only return boss shot if it's NOT a 'Boss Twin Lazer'
                    if (entity.type !== COLLISION_CONFIG.WEAPON_TYPES.BOSS_LAZER_SHOT) {
                        return_boss_shot_to_pool(entity);
                    }

                    break; 
                }
            }
        }      
    }); 
}
