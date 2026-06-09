/**
 * Executes a sequence of homing projectiles fired from the boss toward the player's current location.
 * 
 * This asynchronous function fires a specified number of shots with a timed interval between each.
 * Each shot calculates the player's (Bazis) coordinates at the moment of firing to determine 
 * its trajectory.
 * 
 * @async
 * @function boss_homing_shooting
 * @param {number} number_of_shots - The total count of projectiles to fire in this sequence.
 * @param {number} duration - The travel time for each projectile in milliseconds.
 * @param {string} audio_key - The ID of the audio element to play for each shot.
 * @param {number} interval_ms - The delay in milliseconds between consecutive shots.
 * @param {string} shot_style_key - The key used to look up configuration in `BOSS_SHOTS_CONFIG`.
 * @returns {Promise<void>}
 * 
 * @description
 * 1. Validates boss presence and active encounter state.
 * 2. Iterates through the requested shot count using an `await` delay for pacing.
 * 3. In each iteration:
 *    - Re-validates boss and player (Bazis) states to handle mid-sequence destruction.
 *    - Retrieves a projectile from the `POOL_KEYS.BOSS_SHOT` pool.
 *    - Sets the target coordinates based on the player's current center point.
 *    - Animates the projectile toward the target using jQuery `.animate()`.
 * 4. On impact/arrival:
 *    - Triggers a visual explosion via `homing_shot_explosion`.
 *    - Recycles the projectile via `return_boss_shot_to_pool`.
 * 
 * @see {@link get_from_pool} For projectile retrieval.
 * @see {@link homing_shot_explosion} For the impact visual effect.
 */
async function boss_homing_shooting( number_of_shots, duration, audio_key, interval_ms, shot_style_key) {
    const HOMING_SHOT_CONFIG = BOSS_SHOTS_CONFIG[shot_style_key];
    
    const boss_data = boss_level_entities.boss;
        if (!is_entity_valid(boss_data) || !game_data.game_states.boss_flag) {
            console.log("Boss not ready or active to fire homing shots. Skipping boss_fire_2.");
            return;
        }
    
        for (let i = 0; i < number_of_shots; i++) {
            if (!game_data.game_states.boss_flag || boss_data.is_active === false) {
                console.log("Boss deactivated during shot sequence. Cancelling remaining shots.");
                break;
            }
            const bazis_data = base_level_entities.bazis;
            if (!is_entity_valid(bazis_data)) {
                console.warn("Bazis not present for homing shot target. Skipping remaining shots.");
                break;
            }
            const bazis_rect = bazis_data.rect;
            const boss_rect = boss_data.rect;
    
            const boss_shot_data =  get_from_pool(POOL_KEYS.BOSS_SHOT);
            if (!boss_shot_data) {
                console.log("Boss homing shot pool exhausted! Cannot launch homing shot.");
                break; // Stop if pool is empty
            }
            const boss_shot_element = boss_shot_data.element;
            boss_shot_element.attr('class', '').addClass(HOMING_SHOT_CONFIG.CLASS);
    
            boss_shot_data.damage = HOMING_SHOT_CONFIG.DAMAGE;
            boss_shot_data.type = HOMING_SHOT_CONFIG.TYPE;
    
            const shot_initial_x = boss_rect.left + boss_rect.width / 2;
            const shot_initial_y = boss_rect.top + boss_rect.height * HOMING_SHOT_CONFIG.INITIAL_OFFSET_Y; 
    
            const shot_target_x = bazis_rect.left + bazis_rect.width / 2;
            const shot_target_y = bazis_rect.top + bazis_rect.height / 2;            
    
            audio_play(audio_key); 
    
            boss_shot_element.css({
                ...HOMING_SHOT_CONFIG.BASE_STYLE,
                "left": shot_initial_x,
                "top": shot_initial_y
            });
        
            boss_shot_element.animate({
                "top": shot_target_y,
                "left": shot_target_x
            }, duration, "linear", function() {
                if(boss_shot_data.is_active){
                    shot_rect = boss_shot_data.rect;
                    return_boss_shot_to_pool(boss_shot_data);                
                    homing_shot_explosion(shot_rect.top, shot_rect.left);
                }
            });  
        await new Promise(resolve => setTimeout(resolve, interval_ms));  
    }
}

/**
 * Triggers a visual explosion effect for boss homing projectiles.
 * 
 * This function loads a specific explosion graphic, positions it at the provided 
 * coordinates, and executes a scaling animation. It includes a vertical safety check 
 * to prevent explosions from rendering too close to the screen's bottom edge.
 * 
 * @function homing_shot_explosion
 * @param {number} ypoz - The vertical (top) pixel coordinate for the effect.
 * @param {number} xpoz - The horizontal (left) pixel coordinate for the effect.
 * @returns {void}
 * 
 * @description
 * 1. Retrieves visual configuration from `BOSS_SHOTS_CONFIG.HOMING_SHOT_EXPLOSION`.
 * 2. Compares `ypoz` against the screen height to skip rendering if the projectile 
 *    impacted below the allowed visible range (`DISTANCE_FROM_SCREEN_BOTTOM`).
 * 3. Uses `unified_image_loader` to fetch the explosion image.
 * 4. On successful load:
 *    - Positions the element at the (x, y) origin.
 *    - Animates the width and height to their final expansion sizes (`ANIM_X`, `ANIM_Y`).
 *    - Fades out/hides the element after the animation duration.
 * 
 * @see {@link unified_image_loader} For the asynchronous asset fetching logic.
 * @see {@link boss_homing_shooting} The function that typically triggers this effect.
 */
function homing_shot_explosion(ypoz, xpoz) {

    const { IMG_SRC, IMG_CLASS, DISTANCE_FROM_SCREEN_BOTTOM, ANIM_X, ANIM_Y, ANIM_DURATION, HIDE_DURATION}
          = BOSS_SHOTS_CONFIG.HOMING_SHOT_EXPLOSION;
    if( ypoz >= $(window).height() * DISTANCE_FROM_SCREEN_BOTTOM) {
        return;
    }
    unified_image_loader(IMG_SRC, (blue_explosion_img)=> {
        blue_explosion_img.addClass(IMG_CLASS)
        .appendTo($("body"))        
        .css({
            "left": xpoz,
            "top":ypoz               
        })
        .show();
       
        blue_explosion_img.animate({
            "width": ANIM_X,
            "height" : ANIM_Y
        }, ANIM_DURATION, function(){
            $(this).hide(HIDE_DURATION);
        });   
    });   
}