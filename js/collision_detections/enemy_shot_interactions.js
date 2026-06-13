/**
 * Resolves all physical interactions and side effects for a single enemy-fired projectile.
 * 
 * Logic handles:
 * - Player Damage: Standard collision resulting in player health reduction.
 * - Obstacle Collision: Neutralization of projectiles hitting the bounty container.
 * - Friendly Fire: Optional logic (level-dependent) allowing enemies to damage each other,
 *   with a guard to prevent ships from hitting their own projectiles.
 * 
 * @param {Object} shot_data - Data object of the active enemy projectile.
 * @param {Iterable} neighbors - Entities found in the spatial grid cells occupied by the shot.
 */
function resolve_enemy_shot_interactions(shot_data, neighbors) {
    const { BAZIS, ENEMY, BOUNTY } = COLLISION_CONFIG.ENTITY_TYPES;
    const { act_level } = game_data.levels;
    const { ENEMY_AI_LEVEL } = GAME_CONSTANTS;

    for (const target_data of neighbors) {
        if (!shot_data.is_active) break;        

        const target_rect = target_data.rect;

                                                                       // 1. Bazis VS Enemy Shot
        if (target_data.type === BAZIS) {
            if (check_collision(shot_data.rect, target_rect)) {
                bazis_damage(shot_data.damage, target_data);
                return_enemy_shot_to_pool(shot_data);
                break;
            }
        }

                                                                        // 2.  Bounty VS Enemy Shot
        else if ( target_data.type === BOUNTY) {
            if (check_collision(shot_data.rect, target_rect)) {                               
                return_enemy_shot_to_pool(shot_data);
                break;
            }
        }       

                                                                         // 3.  Enemy Shot VS Enemy 
        // Only enabled if below the AI threshold level
        else if (target_data.type === ENEMY && act_level < ENEMY_AI_LEVEL) {
            // Prevent ship from self damage
            if (target_data.id !== shot_data.shooter_id) {
                if (check_collision(shot_data.rect, target_rect)) {
                    enemy_damage(target_data, shot_data.damage);
                    return_enemy_shot_to_pool(shot_data);
                    break;
                }
            }
        }
    }
}