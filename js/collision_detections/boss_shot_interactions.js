function resolve_boss_shot_interactions(shot_data, neighbors) {
    const { ASTEROID } = COLLISION_CONFIG.ENTITY_TYPES;
    const { BOSS_LAZER_SHOT } = COLLISION_CONFIG.WEAPON_TYPES;

    for (const target_data of neighbors) {
        if (!shot_data.is_active) break;

        if (target_data.type === ASTEROID) {                                //  1. Boss Shots VS Asteroid
            if (check_collision(shot_data.rect, target_data.rect)) {
                dust_animation(shot_data, target_data.rect);

                if (shot_data.type === BOSS_LAZER_SHOT) {
                    shot_data.has_hit = true; 
                    shot_data.is_active = false;
                }
                else 
                return_boss_shot_to_pool(shot_data);
            break;
            }
        }
    }
}