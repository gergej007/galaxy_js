/**
 * Resolves interactions between the player (Bazis) and nearby entities.
 * @param {Object} bazis_data - The player entity data.
 * @param {Set|Array} neighbors - Entities found in the grid cells occupied by the player.
 */
function resolve_bazis_interactions(bazis_data, neighbors) {
    const { ENEMY_SHOT, BOSS_SHOT_TYPES }  = COLLISION_CONFIG.WEAPON_TYPES;
    const { ENEMY, BOUNTY, ASTEROID, BOSS } = COLLISION_CONFIG.ENTITY_TYPES;
    const { EMP_STRIKE_ZONE_X_PX, EMP_STRIKE_ZONE_Y_PX, EMP_COOLDOWN_MS, BAZIS_DAMAGE_MULTIPLIER } = COLLISION_CONFIG;

    for (const target_data of neighbors) {
       
        if (!is_entity_valid(bazis_data)) break;

        const bazis_rect = bazis_data.rect;
        const target_rect = target_data.rect;
        
        if (target_data.type === ENEMY_SHOT && target_data.is_active) {        // 1. Bazis VS Enemy Shot
            if (check_collision(bazis_rect, target_rect)) {
                bazis_damage(target_data.damage, bazis_data);
                return_enemy_shot_to_pool(target_data);
                             
                break; 
            }
        }
        if (target_data.type === ENEMY && target_data.is_active) {              // 2. Bazis VS Enemy 
            if (check_collision(bazis_rect, target_rect)) {
                bazis_feedback_moves(target_rect, bazis_data);
                explode_spacekraft(target_data);
                bazis_damage(target_data.damage, bazis_data);
                add_score_n_hit();
            }
        }
        
        if(target_data.type === BOUNTY ) {                                       // 3. Bazis VS Bounty
            if (check_collision(bazis_rect, target_rect)) {

                bazis_feedback_moves(target_rect, bazis_data);

                bounty_container_damage(bazis_data.damage * BAZIS_DAMAGE_MULTIPLIER);       
                bazis_damage(target_data.damage, bazis_data);
            }
        }

        if(POWERUP_TYPES.includes(target_data.type)) {                           // 4. Bazis VS Powerup
            if(check_collision(bazis_rect, target_rect)) {
                pick_up_powerup(target_data);
            }
        }

        if(target_data.type === ASTEROID) {                                        // 5. Bazis VS Asteroid
            if(check_collision(bazis_rect, target_rect)) { 
                bazis_feedback_moves(target_rect, bazis_data);
            }
        }
        if (BOSS_SHOT_TYPES.includes(target_data.type) && target_data.is_active) {  // 6. Bazis VS Boss Shot
            
            if (check_collision(bazis_rect, target_rect)) {
                
                bazis_damage(target_data.damage, bazis_data);
                return_boss_shot_to_pool(target_data);
       }
    }        
        if (target_data.type === BOSS) {                                            // 7. Bazis VS Boss
            const target_rect = target_data.rect;
        
            // A. PHYSICAL CRASH: Only true if body-to-body
            if (check_collision(bazis_rect, target_rect)) {
                bazis_feedback_moves(target_rect, bazis_data);
                // physical contact damage (optional, can be lower than EMP)
            }
        
            // B. EMP SENSING: True if within the configured strike zone
            //  reachable before physical contact
            const is_in_emp_range = 
                bazis_rect.right > target_rect.left - EMP_STRIKE_ZONE_X_PX &&
                bazis_rect.left < target_rect.right + EMP_STRIKE_ZONE_X_PX &&
                bazis_rect.top < target_rect.bottom + EMP_STRIKE_ZONE_Y_PX &&
                bazis_rect.bottom > target_rect.top;
        
            if (is_in_emp_range) {
                const now = Date.now();
                if (!weapons.emp_timeout || now - weapons.emp_timeout > EMP_COOLDOWN_MS) {
                    weapons.emp_timeout = now;
                    boss_emp_shake(target_data, bazis_data); 
                    bazis_damage(target_data.damage, bazis_data);   
                }          
            }
        }
    }     
}
