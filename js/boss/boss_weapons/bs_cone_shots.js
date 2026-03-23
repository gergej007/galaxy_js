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

    const shots_to_animate = []; // Collect shot_data objects to animate simultaneously         
    const initial_shot_y = boss_rect.top + boss_rect.height * 0.85;           
    const initial_shot_x = boss_rect.left + boss_rect.width / 2;

    for (let shot_idx = 0; shot_idx < shot_repeat; shot_idx++) {
        const boss_shot_data = get_boss_shot_from_pool();

        if (!boss_shot_data) {
            console.warn("Boss shot pool exhausted for boss_fire_1. Skipping remaining shots in burst.");
            break; // Stop if pool is empty
        }
        const boss_shot_element = boss_shot_data.element;

        // --- Configure the shot from config ---
        boss_shot_element.removeClass(Object.values(BOSS_SHOTS_CONFIG)
        .map(s => s.CLASS).join(' ')); // Clear all specific shot classes
        boss_shot_element.addClass(CONE_SHOT_CONFIG.CLASS);

        boss_shot_data.damage = CONE_SHOT_CONFIG.DAMAGE;
        boss_shot_data.type = CONE_SHOT_CONFIG.TYPE;
        boss_shot_data.rect = null;  
            
        // boss_shot_element.css(CONE_SHOT_CONFIG.BASE_STYLE);
        boss_shot_element.css({
            ...CONE_SHOT_CONFIG.BASE_STYLE,
            "left": initial_shot_x,
            "top": initial_shot_y,               
            "display": "block", 
            "opacity": 1 
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
        }, shot_duration, "linear", function () { 
            return_boss_shot_to_pool(boss_shot_data_item); 
        });
    });
}