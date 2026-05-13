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
function boss_damage(bazis_shot_data, boss_data, damage_value){

    boss_level_entities.boss.hp -= damage_value;
    score_dependent_fns();  
    update_progressbar( boss_level_entities.boss.hp);                

    if ( boss_level_entities.boss.hp < 1) {
        boss_dies();
        }
   
    if( bazis_shot_data && (bazis_shot_data.type === "single" || bazis_shot_data.type === "Hyper Shot")){
        show_boss_damage( bazis_shot_data, boss_data);   
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
 */
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


/**
 * Initiates the boss's death sequence when its HP falls below 1.
 * This function performs several critical actions to transition the game state
 * from active boss fight to boss defeated, including:
 * - Activating player invincibility (god mode).
 * - Triggering visual and audio effects for the boss's destruction.
 * - Stopping all boss movement and clearing its scheduled actions.
 * - Cleaning up all active projectiles from both the player and the boss.
 * - Exploding asteroid. 
 * - Updating the game score and displaying relevant UI changes.
 * - Preparing the game state for potential level transition or win condition.
 *
 * @returns {void}
 */
function boss_dies() {  
    weapons.flags.god_mode = true;    

    const {ANIM_DURATION, BOSS_KILLED_SCORE, DELAY_AUDIO, SCREEN_SHAKE_DURATION, AUDIO_KEYS, LAZER_SOUND} 
          = BOSS_DIES_CONFIG;

    audio_stop(LAZER_SOUND);
    const boss_data = boss_level_entities.boss;
    if(!is_entity_valid(boss_data)) return;

    const boss_element = validate_boss_for_movement(boss_data, "boss_dies");
    const boss_rect = boss_level_entities.boss.rect;
    
    boss_dies_main_explosion(boss_rect);
    boss_dies_side_explosion(boss_rect);
    trigger_screen_shake(0,SCREEN_SHAKE_DURATION);

    game_data.game_states.boss_flag = false;  

    base_level_entities.bazis_shots.filter( bazis_shot_data => bazis_shot_data.is_active)
    .forEach( bazis_shot_data => {
        return_bazis_shot_to_pool(bazis_shot_data);
    });         
    boss_level_entities.boss_shots.filter( boss_shot_data => boss_shot_data.is_active)
    .forEach(boss_shot_data => {
        return_boss_shot_to_pool(boss_shot_data);
    });

    boss_element.stop(true, false);
    boss_element.animate({
        "opacity" : 0
    }, ANIM_DURATION, function(){
        $(this).remove();
    });    
    boss_data.attack_timeout_ids = null;
    game_data.counters.killed++;
    game_data.counters.score += BOSS_KILLED_SCORE;
    update_right_display();
       
    bazis_exit();

    const asteroid_data = boss_level_entities.asteroid;
    if( is_entity_valid(asteroid_data )){
       explode_spacekraft(asteroid_data);                                                             
    }
 
    audio_play(AUDIO_KEYS[0]);
    setTimeout(function(){
        audio_play(AUDIO_KEYS[1]);
    },DELAY_AUDIO);
}   