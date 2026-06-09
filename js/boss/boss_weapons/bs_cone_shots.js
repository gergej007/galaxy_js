/**
 * Executes a fan-shaped projectile burst (cone attack) from the boss entity.
 * 
 * This function handles the initialization of multiple projectiles from the pool, 
 * configures their appearance and damage based on the provided style key, and 
 * animates them in a spread pattern toward the bottom of the screen.
 * 
 * @function boss_cone_shooting
 * @param {number} shot_repeat - The number of projectiles to fire in the burst.
 * @param {number} distance_between_shots - The horizontal spacing (in pixels) between landing points.
 * @param {number} shot_duration - The duration of the movement animation in milliseconds.
 * @param {string} shot_style_key - The key used to look up configuration in `BOSS_SHOTS_CONFIG`.
 * @param {string} audio_key - The ID of the audio element to play when firing.
 * @returns {void}
 * 
 * @description
 * 1. Verifies that the boss encounter is still active via `boss_flag`.
 * 2. Validates the boss entity and retrieves its current screen coordinates.
 * 3. Fetches `shot_repeat` projectiles from the `POOL_KEYS.BOSS_SHOT` pool.
 * 4. Configures each projectile with CSS classes, damage values, and starting positions.
 * 5. Calculates a symmetrical horizontal spread centered on the boss's current X position.
 * 6. Triggers a jQuery `.animate()` call for each projectile toward its calculated target X at the screen bottom.
 * 7. Recycles projectiles back to the pool using a completion callback.
 * 
 * @see {@link get_from_pool} For the projectile retrieval logic.
 * @see {@link return_boss_shot_to_pool} For the projectile recycling logic.
 */
function boss_cone_shooting( shot_repeat, distance_between_shots, shot_duration, shot_style_key, audio_key){
        
    if ( !game_data.game_states.boss_flag) {
        console.log("Boss level is over.");
        return;
    }
    const boss_data = boss_level_entities.boss;
    const boss_element = validate_boss_for_movement(boss_data, "boss_fire_1");
    if (boss_element === null) {
        return; 
    }

    const boss_rect = boss_data.rect;

    const CONE_SHOT_CONFIG = BOSS_SHOTS_CONFIG[shot_style_key];
    if (!CONE_SHOT_CONFIG) {
        console.warn(`Boss shot style not found for key: ${shot_style_key}. Skipping boss_fire_1.`);
        return;
    }

    audio_play(audio_key);

    const shots_to_animate = [];        
    const initial_shot_y = boss_rect.top + boss_rect.height * CONE_SHOT_CONFIG.INITIAL_OFFSET_Y;           
    const initial_shot_x = boss_rect.left + boss_rect.width / 2;

    for (let shot_idx = 0; shot_idx < shot_repeat; shot_idx++) {
        const boss_shot_data = get_from_pool(POOL_KEYS.BOSS_SHOT);

        if (!boss_shot_data) {
            console.warn("Boss shot pool exhausted for boss_fire_1. Skipping remaining shots in burst.");
            break; // Stop if pool is empty
        }
        const boss_shot_element = boss_shot_data.element;
        
        boss_shot_element.attr('class', '').addClass(CONE_SHOT_CONFIG.CLASS);

        boss_shot_data.damage = CONE_SHOT_CONFIG.DAMAGE;
        boss_shot_data.type = CONE_SHOT_CONFIG.TYPE;
            
        boss_shot_element.css({
            ...CONE_SHOT_CONFIG.BASE_STYLE,
            "left": initial_shot_x,
            "top": initial_shot_y
        });

        shots_to_animate.push(boss_shot_data);
    }  
    const total_spread_width_at_bottom = (shot_repeat - 1) * distance_between_shots;
    const center_landing_x_at_bottom = initial_shot_x;
    const leftmost_target_x_at_bottom = center_landing_x_at_bottom - (total_spread_width_at_bottom / 2);

    shots_to_animate.forEach((boss_shot_data_item, i) => {
        const boss_shot_element_item = boss_shot_data_item.element; 

        const target_x_at_bottom = leftmost_target_x_at_bottom + (i * distance_between_shots);
        const target_land_y = $(window).height();     
       
        boss_shot_element_item.animate({
            "top": target_land_y,
            "left": target_x_at_bottom
        }, shot_duration, CONE_SHOT_CONFIG.ANIM_EASING, function () { 
            return_boss_shot_to_pool(boss_shot_data_item); 
        });
    });
}