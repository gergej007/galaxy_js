/**
 * Fires a sequence of twin lazer shots from the boss.
 * The lazers emerge from specific points on the boss and animate downwards,
 * fading and shrinking. Uses pooling and configuration for control.
 *
 * @param {number} delay - Initial delay before this firing pattern starts (from when boss_fire_3 is called).
 * @returns {void}
 */
async function boss_lazer_shooting(shot_repeat, anim_speed, audio_key, interval_ms, shot_style_key) {                             // Boss lazer
   
    const LAZER_CONFIG = BOSS_SHOTS_CONFIG[shot_style_key];   
    
    const boss_data = boss_level_entities.boss;
    if (!boss_data || !boss_data.element || boss_data.element.length === 0 || !game_data.game_states.boss_flag) {
        console.log("Boss not present to fire. Skipping boss_fire_3.");
        return;
    }
        
    audio_play(audio_key);

    let boss_rect = boss_data.rect;
    const boss_center_x_abs = boss_rect.left + (boss_rect.width / 2);
    const pair_offset_from_center_pixels = boss_rect.width * LAZER_CONFIG.X_OFFSET_PERCENT_FROM_CENTER;
    const lazer_horizontal_offsets_from_boss_left_for_pair = [
        (boss_center_x_abs - pair_offset_from_center_pixels) - boss_rect.left, // Left shot's offset from boss_rect.left
        (boss_center_x_abs + pair_offset_from_center_pixels) - boss_rect.left  // Right shot's offset from boss_rect.left
    ];      

    for (let i = 0; i < shot_repeat/*LAZER_CONFIG.LAZER_MAX_COUNT*/; i++){
        if (!game_data.game_states.boss_flag || boss_data.is_active === false) {
            console.log("Boss deactivated during lazer sequence. Cancelling remaining lazers.");
            break;
        }
        current_lazer_animations = [];
        for (const x_offset_from_boss_left of lazer_horizontal_offsets_from_boss_left_for_pair)
            {
            const lazer_data = get_boss_shot_from_pool();

            if (!lazer_data) {
                console.warn("Boss lazer pool exhausted! Cannot launch lazer.");
                continue; // Continue to next offset if one is exhausted
            }
            const lazer_element = lazer_data.element;
            lazer_element.removeClass(Object.values(window.BOSS_SHOTS_CONFIG)
            .map(s => s.CLASS).join(' '));
            lazer_element.addClass(LAZER_CONFIG.CLASS);
            lazer_data.damage = LAZER_CONFIG.DAMAGE;
            lazer_data.type = LAZER_CONFIG.TYPE;
            lazer_data.rect = null;

            boss_rect = boss_data.rect;
            const lazer_initial_x = boss_rect.left + x_offset_from_boss_left;
            const lazer_initial_y = boss_rect.top + boss_rect.height - LAZER_CONFIG.Y_OFFSET_CORRECTION;

            let direction_correction = boss_data.direction === "moving_right" ? LAZER_CONFIG.DIRECTION_CORRECTION * $(window).width()
                                                   : -LAZER_CONFIG.DIRECTION_CORRECTION * $(window).width();

            lazer_element.css(LAZER_CONFIG.BASE_STYLE);
            lazer_element.css({
                "left": lazer_initial_x + direction_correction,
                "top": lazer_initial_y,                    
                "opacity": 0, 
                "display": "block"                       
            });

            const lazer_animation_promise = new Promise(resolve => {
                lazer_data.resolve_animation_promise = resolve;

                lazer_element.animate({
                    "height": $(window).height() - boss_rect.top,            // Animate to near bottom
                    "top": $(window).height() * LAZER_CONFIG.LAZER_ANIM_TARGET_TOP_PERCENT, // Animate top to target %
                    "opacity": LAZER_CONFIG.ANIM_OPACITY_1                  // Appear fully
                }, anim_speed, "linear", function() {
                    // Phase 2: Fade out/shrink
                    $(this).animate({
                        "height": LAZER_CONFIG.ANIM_HEIGHT_2,
                        "top": $(window).height(),                          //  Move off-screen
                        "opacity": LAZER_CONFIG.ANIM_OPACITY_2
                    }, anim_speed, "linear", function() {
                         return_boss_shot_to_pool(lazer_data);             // Return to pool after animation
                         resolve();                         // Resolve this specific lazer's animation promise
                    });
                });
            });
            current_lazer_animations.push(lazer_animation_promise);
        }
        await Promise.all(current_lazer_animations);
        await new Promise(resolve => setTimeout(resolve, interval_ms)); 
    }
}