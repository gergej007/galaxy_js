/**
 * Orchestrates a series of twin-laser bursts from the Boss.
 * 
 * This function calculates precise spawn coordinates for paired lasers relative to 
 * the Boss center, manages the attack interval using Promises, and ensures visual 
 * state (direction/offsets) is refreshed every burst to account for Boss movement.
 * 
 * @async
 * @param {number} shot_repeat - The total number of laser bursts to fire in this sequence.
 * @param {number} anim_speed - Visual speed of the laser growth (often overridden by config).
 * @param {string} audio_key - jQuery selector for the sound effect (e.g., "#lazer_audio").
 * @param {number} interval_ms - The delay in milliseconds between each burst.
 * @param {string} shot_style_key - Key used to retrieve configuration from BOSS_SHOTS_CONFIG.
 * 
 * @returns {Promise<void>} Resolves when the entire shooting sequence is complete.
 * 
 * @example
 * // Triggered by the attack scheduler
 * await boss_lazer_shooting(5, 200, "#lazer1", 500, "LAZER_SHOT");
 */
async function boss_lazer_shooting(shot_repeat, anim_speed, audio_key, interval_ms, shot_style_key) {
    const LAZER_CONFIG = BOSS_SHOTS_CONFIG[shot_style_key];   
    const boss_data = boss_level_entities.boss;

    if (!is_entity_valid(boss_data) || !game_data.game_states.boss_flag) return;
    audio_play(audio_key);

    for (let i = 0; i < shot_repeat; i++) {
        if (!game_data.game_states.boss_flag || !is_entity_valid(boss_data)) break;

        const boss_rect = boss_data.element[0].getBoundingClientRect();
        const current_lazer_animations = [];

        // Logic for calculating pair offsets...
        const offsets = calculate_lazer_offsets(boss_rect, LAZER_CONFIG);

        for (const x_offset of offsets) {
            const lazer_data = get_from_pool(POOL_KEYS.BOSS_SHOT);
            if (!lazer_data) continue;

            setup_lazer_styles(lazer_data, boss_rect, x_offset, boss_data.direction, LAZER_CONFIG);
            
            // Call the extracted animator
            current_lazer_animations.push(animate_single_lazer(lazer_data, LAZER_CONFIG, boss_rect));
        }

        await Promise.all(current_lazer_animations);
        await new Promise(resolve => setTimeout(resolve, interval_ms)); 
    }
}

/**
 * Handles the visual lifecycle of a single laser beam.
 * @param {Object} lazer_data - The pooled shot entity.
 * @param {Object} config - The LAZER_CONFIG object.
 * @param {DOMRect} boss_rect - Fresh coordinates of the boss.
 * @returns {Promise} Resolves when the laser is returned to the pool.
 */
function animate_single_lazer(lazer_data, config, boss_rect) {
    return new Promise(resolve => {
        const lazer_element = lazer_data.element;
        const win_height = $(window).height();
        
        // Reset state for pooled object
        lazer_data.has_hit = false;
        lazer_data.resolve_animation_promise = resolve;

        // Phase 1: Growth
        lazer_element.animate({
            "height": win_height - boss_rect.bottom,            
            "top": boss_rect.bottom + config.INITIAL_OFFSET_X_PX, 
            "opacity": config.ANIM_OPACITY_1                  
        }, {
            duration: config.ANIM_DURATION_1_MS,
            easing: config.ANIM_EASING,
            step: function(now, fx) {
                if (lazer_data.has_hit) {
                    $(this).stop(true, false);
                    $(this).animate({ "opacity": 0.0 }, 50, () => {
                        return_boss_shot_to_pool(lazer_data);
                        resolve();
                    });
                }
            },               
            complete: function() {
                if (lazer_data.has_hit) return;

                // Phase 2: Fade out/shrink (The "Miss" animation)
                $(this).animate({
                    "height": win_height * config.ANIM_2_HEIGHT_FACTOR,
                    "top": win_height * config.ANIM_2_TOP_FACTOR,                          
                    "opacity": config.ANIM_OPACITY_2
                }, config.ANIM_DURATION_2_MS, config.ANIM_EASING, () => {
                     return_boss_shot_to_pool(lazer_data);             
                     resolve();
                });
            } 
        });
    });
}

/**
 * Calculates the horizontal offsets for a pair of lasers relative to the boss center.
 * @param {DOMRect} boss_rect 
 * @param {Object} config 
 * @returns {number[]} Array of x-offsets.
 */
function calculate_lazer_offsets(boss_rect, config) {
    const boss_center_x = boss_rect.left + (boss_rect.width / 2);
    const pair_offset_from_center = boss_rect.width * config.X_OFFSET_PERCENT_FROM_CENTER;
    
    return [
        (boss_center_x - pair_offset_from_center) - boss_rect.left, // Left offset
        (boss_center_x + pair_offset_from_center) - boss_rect.left  // Right offset
    ];
}

/**
 * Initializes a laser's CSS position, styles, and collision metadata.
 * @param {Object} lazer_data - The pooled shot entity.
 * @param {DOMRect} boss_rect - Fresh coordinates of the boss.
 * @param {number} x_offset - Calculated horizontal offset from boss left.
 * @param {string|null} direction - Current movement direction of the boss.
 * @param {Object} config - The LAZER_SHOT configuration object.
 */
function setup_lazer_styles(lazer_data, boss_rect, x_offset, direction, config) {
    const lazer_element = lazer_data.element;

    lazer_element.attr('class', '').addClass(config.CLASS);
    
    lazer_data.damage = config.DAMAGE;
    lazer_data.type = config.TYPE;
    
    // 3. Calculate the spawn point
    const lazer_initial_x = boss_rect.left + x_offset;
    const lazer_initial_y = boss_rect.top + boss_rect.height - config.Y_OFFSET_CORRECTION;

    // 4. Apply horizontal slide correction based on boss velocity
    let direction_correction = direction === "moving_right" 
        ? config.DIRECTION_CORRECTION * $(window).width()
        : -config.DIRECTION_CORRECTION * $(window).width();

    lazer_element.css({
        ...config.BASE_STYLE,
        "left": lazer_initial_x + direction_correction,
        "top": lazer_initial_y        
    });
}
