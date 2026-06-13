/**
 * Resolves physical interactions for a single enemy ship.
 * 
 * Logic handles:
 * - Ship Bumping: Mutual destruction when two enemy ships collide.
 * - Obstacle Impact: Destruction of the ship upon hitting the bounty container.
 * 
 * @param {Object} enemy_data - Data object of the active enemy ship.
 * @param {Iterable} neighbors - Entities found in the spatial grid cells occupied by the ship.
 */
function resolve_enemy_ship_interactions(enemy_data, neighbors) {
    const { ENEMY, BOUNTY } = COLLISION_CONFIG.ENTITY_TYPES;

    for (const target_data of neighbors) {
        if (!enemy_data.is_active) break;       
       
        if (target_data.type === ENEMY && target_data.id !== enemy_data.id) {          // 1. Enemy vs Enemy 
            if (check_collision(enemy_data.rect, target_data.rect)) {
                explode_spacekraft(enemy_data);
                explode_spacekraft(target_data); 
            }
        }
        
        else if (target_data.type === BOUNTY) {                                        // 2. Enemy vs Bounty
            if (check_collision(enemy_data.rect, target_data.rect)) {
                explode_spacekraft(enemy_data);
            }
        }
    }
}