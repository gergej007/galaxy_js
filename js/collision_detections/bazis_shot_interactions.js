/**
 * Resolves all physical interactions and side effects for a single player-fired projectile.
 * 
 * Logic handles:
 * - Projectile Clashes: Neutralizes enemy shots; handles indestructible boss lazers.
 * - Piercing: Lazer-type weapons damage multiple enemies via hit-tracking (Set).
 * - Environmental: Triggers animations for asteroids and damage for bounty containers.
 * - Boss Combat: Coordinates damage application to the boss entity.
 * 
 * @param {Object} shot_data - Data object of the active player projectile.
 * @param {Iterable} neighbors - Entities found in the spatial grid cells occupied by the shot.
 */
function resolve_bazis_shot_interactions(shot_data, neighbors) {
    const { BOSS_SHOT_TYPES, BOSS_LAZER_SHOT, ENEMY_SHOT } = COLLISION_CONFIG.WEAPON_TYPES;
    const { ENEMY, BOUNTY, ASTEROID, BOSS } = COLLISION_CONFIG.ENTITY_TYPES;

    for (const target_data of neighbors) {
        if (!shot_data.is_active) break;

        const target_rect = target_data.rect;

        if(target_data.type === ENEMY_SHOT && target_data.is_active) {              // 0. Bazis Shots VS Enemy Shots
            if (check_collision(shot_data.rect, target_rect)) {
                shots_explosion_lightning(shot_data.rect.left, shot_data.rect.top);
                return_bazis_shot_to_pool(shot_data);
                return_enemy_shot_to_pool(target_data);
                gain_bazis_healthpoint();
                break;
            }
        }
        
        if (BOSS_SHOT_TYPES.includes(target_data.type) && target_data.is_active) {  // 1. Bazis Shot VS Boss Shots
            if (check_collision(shot_data.rect, target_rect)) {
                if(target_data.type !== BOSS_LAZER_SHOT) {
                shots_explosion_lightning(shot_data.rect.left, shot_data.rect.top);
                return_bazis_shot_to_pool(shot_data);
                }               
                break; 
            }
        }
        
        else if (target_data.type === ENEMY && target_data.is_active) {              // 2. Bazis Shot VS Enemy
            if (check_collision(shot_data.rect, target_rect)) {
                const is_lazer = COLLISION_CONFIG.WEAPON_TYPES.LAZER_TYPES.includes(shot_data.type);

                if (is_lazer) {
                    if (!shot_data.enemies_hit_ids.has(target_data.id)) {
                        enemy_damage(target_data, shot_data.damage);
                        shot_data.enemies_hit_ids.add(target_data.id);
                    }
                    // Lazers continue the 'for...of' loop to hit other enemies in the same cell
                } else {
                    enemy_damage(target_data, shot_data.damage);
                    return_bazis_shot_to_pool(shot_data);
                    
                    break; 
                }               
            }
        }
        
        else if ((target_data.type === BOSS || target_data.type === ASTEROID)) {   // 3. Bazis Shots VS Boss or Asteroid
            if (check_collision(shot_data.rect, target_rect)) {
                target_data.type === BOSS ? boss_damage(shot_data, target_data, shot_data.damage) : dust_animation(shot_data, target_rect);
                               
                return_bazis_shot_to_pool(shot_data);
                break;
            }
        }
       
        else if (target_data.type === BOUNTY ) {                                   // 4. Bazis Shots VS Bounty 
            if (check_collision(shot_data.rect, target_rect)) {
                bounty_container_damage(shot_data.damage);
                return_bazis_shot_to_pool(shot_data);
                break;
            }
        }
    }
}