/**
 * Applies damage to the boss, updates its health, and triggers relevant game events
 * such as UI updates, scoring, and the boss's death sequence if its HP falls to zero.
 * It also conditionally triggers visual feedback for direct projectile impacts.
 *
 * @param {object|null} bazis_shot_data - The data object of the projectile that hit the boss.
 *                                        Pass `null` if the damage is not from a specific projectile
 *                                        (e.g., from an area-of-effect ability like an A-bomb).
 *                                        Expected to have a `type` property (e.g., "single", "Hyper Shot").
 * @param {object} boss_data - The data object representing the boss, typically `boss_level_entities.boss`.
 *                             This object is expected to have properties like `hp` and `element`.
 * @param {number} damage_value - The amount of damage to subtract from the boss's current HP.
 * @returns {void}
 */
function boss_damage(bazis_shot_data, boss_data, damage_value) {
    if (!boss_data) {
        console.warn("boss_damage called without valid boss_data");
        return;
    }
    if (boss_data.hp <= 0) return;   
   
    //  If it's a direct projectile hit, show impact effect
    if (bazis_shot_data && bazis_shot_data.is_active) {
        show_boss_damage(bazis_shot_data, boss_data);   
    }

    //  Apply damage and update UI (this now runs for BOTH projectiles and A-bombs)
    boss_data.hp -= damage_value;
    update_progressbar(boss_data.hp);      
    
    //  Check for death
    if (boss_data.hp <= 0) {
        boss_dies();
    }
}


/**
 * Displays a visual impact explosion on the boss at the point of projectile hit.
 * The position and alignment of the explosion are adjusted based on specific
 * horizontal zones of the boss's image to create a more realistic effect.
 * The explosion then slides horizontally according to the boss's movement direction.
 *
 * @param {object} bazis_shot_data - The data object of the projectile that hit the boss.
 *                                   Expected to have `rect` for impact coordinates.
 * @param {object} boss_data - The boss's data object, including `element`, `rect`, and `direction`.
 * @returns {void}
 */                                                           /*
function show_boss_damage(bazis_shot_data, boss_data) {
    impact_player();

    if (!is_entity_valid(bazis_shot_data) || !is_entity_valid(boss_data)) {
       
        console.warn("Invalid projectile or Boss data! Damage animation cancelled!");
        return;
    }

    const {
        IMAGE_SRC, CLASS, INITIAL_WIDTH, FINAL_WIDTH, ANIM_DURATION,
        ZONE_PERCENTAGES, ALIGNMENT, SAFE_EDGE_ZONE, HORIZONTAL_FOLLOW_RATE_WINDOW_WIDTH_PERCENT,
        EDGE_CORRECTION, MOVING_LEFT, MOVING_RIGHT, ANIM_EASING
    } = IMPACT_VISUALS_CONFIG;
   
    let impact_x = bazis_shot_data.rect.left; 
    let impact_y = bazis_shot_data.rect.top;

    const boss_x = boss_data.rect.left;
    const boss_width = boss_data.rect.width;

    // Impact is too close to Boss' edges, cancel animation
    if( impact_x < boss_x + SAFE_EDGE_ZONE || impact_x > boss_x + boss_width -SAFE_EDGE_ZONE ){
        return;
    }
    // Define Horizontal Zones (using percentages) 
    const side_zone_width = boss_width * ZONE_PERCENTAGES.SIDE_WIDTH_PERCENT; 

    const left_zone_end_x = boss_x + side_zone_width;
    const right_zone_start_x = boss_x + boss_width - side_zone_width;

    // Apply Vertical Alignment based on Horizontal Impact Zone
    if (impact_x >= boss_x && impact_x < left_zone_end_x) {
        // Left Side Zone
        impact_y -= ALIGNMENT.Y_OUTER;
    } else if (impact_x > right_zone_start_x && impact_x <= boss_x + boss_width) {
        // Right Side Zone
        impact_y -= ALIGNMENT.Y_OUTER;
    } else {
        // Middle Zone
        impact_y -= ALIGNMENT.Y_MIDDLE;
    }  
    

    if (impact_x >= boss_x && impact_x <= boss_x + (boss_width * EDGE_CORRECTION.THRESHOLD_PERCENT)) { 
        impact_x += EDGE_CORRECTION.AMOUNT_X;
        impact_y -= EDGE_CORRECTION.AMOUNT_Y;
    } else if (impact_x <= boss_x + boss_width && impact_x >= boss_x + boss_width - (boss_width * EDGE_CORRECTION.THRESHOLD_PERCENT)) { // Right 5%
        impact_x -= EDGE_CORRECTION.AMOUNT_X;
        impact_y -= EDGE_CORRECTION.AMOUNT_Y;
    }  

    unified_image_loader(IMAGE_SRC, (boss_hit_explosion_img) => {
        boss_hit_explosion_img.addClass(CLASS)
            .appendTo($("body"))
            .show()
            .css({
                "left": impact_x, 
                "top": impact_y,
                "width": INITIAL_WIDTH,
                "position": "absolute" 
            });

        // Calculate horizontal slide during animation based on WINDOW WIDTH 
        let slide_amount_pixels = $(window).width() * HORIZONTAL_FOLLOW_RATE_WINDOW_WIDTH_PERCENT;
        
        if (boss_data.direction === MOVING_LEFT) {
            slide_amount_pixels = -slide_amount_pixels; 
        } else if (boss_data.direction === MOVING_RIGHT) {
            
        } else {
            slide_amount_pixels = 0; // No horizontal slide if boss isn't moving horizontally
        }
        
        boss_hit_explosion_img.animate({
            "width": FINAL_WIDTH,       
            "left": `+=${slide_amount_pixels}` // Slide horizontally relative to current position
        }, ANIM_DURATION, ANIM_EASING, function () {
            $(this).remove(); 
        });
    });
}  
*/

/**
 * Orchestrates the visual feedback for boss hits by calculating impact coordinates,
 * determining horizontal slide based on boss movement, and triggering the explosion animation.
 * 
 * @param {object} bazis_shot_data - Data of the projectile hitting the boss, including its bounding rect.
 * @param {object} boss_data - Current state of the boss, including its bounding rect and movement direction.
 */
function show_boss_damage(bazis_shot_data, boss_data) {
    impact_player();

    if (!is_entity_valid(bazis_shot_data) || !is_entity_valid(boss_data)) return;

    const { SAFE_EDGE_ZONE, IMAGE_SRC, CLASS, INITIAL_WIDTH, FINAL_WIDTH, ANIM_DURATION, ANIM_EASING } = IMPACT_VISUALS_CONFIG;
    const { rect: bazis_rect } = bazis_shot_data;
    const { rect: boss_rect, direction } = boss_data;

    // Boundary Guard
    if (bazis_rect.left < boss_rect.left + SAFE_EDGE_ZONE || bazis_rect.left > boss_rect.right - SAFE_EDGE_ZONE) return;

    const { x, y } = calculate_impact_position(bazis_rect, boss_rect);
    const slide = get_impact_slide_amount(direction);

    unified_image_loader(IMAGE_SRC, ($img) => {
        $img.addClass(CLASS).appendTo("body").show().css({
            left: x,
            top: y,
            width: INITIAL_WIDTH,
            position: "absolute"
        }).animate({
            width: FINAL_WIDTH,
            left: `+=${slide}`
        }, ANIM_DURATION, ANIM_EASING, function() {
            $(this).remove();
        });
    });
}

/**
 * Calculates adjusted impact coordinates based on boss zones and edge correction.
 * @returns {{x: number, y: number}}
 */
function calculate_impact_position(bazis_rect, boss_rect) {
    const { ZONE_PERCENTAGES, ALIGNMENT, EDGE_CORRECTION } = IMPACT_VISUALS_CONFIG;
    
    let x = bazis_rect.left;
    let y = bazis_rect.top;
    const side_width = boss_rect.width * ZONE_PERCENTAGES.SIDE_WIDTH_PERCENT;
    const threshold = boss_rect.width * EDGE_CORRECTION.THRESHOLD_PERCENT;

    // Vertical Alignment
    const is_side_zone = (x < boss_rect.left + side_width) || (x > boss_rect.right - side_width);
    y -= is_side_zone ? ALIGNMENT.Y_OUTER : ALIGNMENT.Y_MIDDLE;

    // Edge Correction
    if (x <= boss_rect.left + threshold) {
        x += EDGE_CORRECTION.AMOUNT_X;
        y -= EDGE_CORRECTION.AMOUNT_Y;
    } else if (x >= boss_rect.right - threshold) {
        x -= EDGE_CORRECTION.AMOUNT_X;
        y -= EDGE_CORRECTION.AMOUNT_Y;
    }

    return { x, y };
}

/**
 * Determines the horizontal slide amount for the impact animation.
 */
function get_impact_slide_amount(direction) {
    const { MOVING_LEFT, MOVING_RIGHT, HORIZONTAL_FOLLOW_RATE_WINDOW_WIDTH_PERCENT } = IMPACT_VISUALS_CONFIG;
    const base_slide = $(window).width() * HORIZONTAL_FOLLOW_RATE_WINDOW_WIDTH_PERCENT;

    if (direction === MOVING_LEFT) return -base_slide;
    if (direction === MOVING_RIGHT) return base_slide;
    return 0;
}


