/**
 * Processes damage logic for the Bazis and manages health/life state transitions.
 * 
 * This function evaluates incoming damage against current HP and lives. It handles 
 * the branching logic for game-over states, life-loss resets, and visual injury 
 * feedback while respecting global state flags like god_mode.
 * 
 * @function bazis_damage
 * @param {number} act_damage - The amount of health points to deduct from the player.
 * @param {Object} bazis_data - The data object representing the player ship.
 * @returns {void}
 * 
 * @description
 * 1. Checks if 'god_mode' is active or if the player is already exploding; returns early if so.
 * 2. Deducts damage from the global `base_level_entities.bazis.hp`.
 * 3. Case A (Death): If HP falls below 1 and only 1 life remains, triggers `bazis_dies`.
 * 4. Case B (Life Loss): If HP falls below 1 but extra lives remain: triggers: `bazis_use_next_life`.
 * 5. Case C (Injury): If HP remains above 0:
 *    - Triggers visual hit feedback via `show_bazis_damage`.
 *    - Triggers sound/controller feedback via `impact_player`.
 * 
 * @see {@link bazis_dies} For handling the final destruction of the player.
 * @see {@link bazis_explode} For the visual explosion sequence.
 * @see {@link show_bazis_damage} For the injury lighting/filter effects.
 */
function bazis_damage(act_damage, bazis_data) {                           // Bazis damage actions
   
    if( weapons.flags.god_mode ) { return; }

    if (!is_entity_valid(bazis_data) || bazis_data.is_exploding) {
        return;
    }
    const bazis_element = $(bazis_data.element); 

    base_level_entities.bazis.hp -= act_damage;
    h_points = base_level_entities.bazis.hp;         
    
    if( base_level_entities.bazis.lives === 1 && h_points < 1) {            //  Dies
        bazis_dies(bazis_data);        
    }     

   else if (h_points < 1 && base_level_entities.bazis.lives > 0) {       //  Use next life
        bazis_use_next_life(bazis_data);

    }
    else if (base_level_entities.bazis.lives > 0 && h_points > 0) {      //  Injure
        score_dependent_fns();
        show_bazis_damage(bazis_element);
        impact_player();
    }
}         
                        
/**
 * Triggers visual feedback for when the Bazis (player) is hit.
 * Applies a lightning GIF overlay and a light-blue flash filter to the ship.
 * 
 * @param {jQueryObject} bazis_element - The main container DIV of the player ship.
 */
function show_bazis_damage(bazis_element){                           
    if (!bazis_element?.length ) return; 
    
    const {CSS_FILTER, DAMAGE_DURATION, DAMAGE_IMG_SRC, DAMAGE_IMG_CSS, DAMAGE_IMG_ANIMATION, ANIMATION_EASING}
    = BAZIS_CONFIG.DAMAGE;
    
    bazis_element.css({'filter': CSS_FILTER});
    setTimeout(() => {
        if (bazis_element.length > 0) {
            bazis_element.css({ filter: "none" });
        }
    }, DAMAGE_DURATION);

    unified_image_loader( DAMAGE_IMG_SRC, (lightning_img)=>{
        lightning_img.appendTo(bazis_element).show()
        .css(DAMAGE_IMG_CSS);

        lightning_img.animate( DAMAGE_IMG_ANIMATION,
             DAMAGE_DURATION, ANIMATION_EASING, function () {
            $(this).remove(); 
        });       
    });  
}

/**
 * Triggers the Bazis' (player) explosion visual effect.
 * Uses a robust loading pattern to ensure the effect displays even if the image is cached.
 * 
 * @param {object} bazis_data - The data object from base_level_entities.bazis
 */
function bazis_explode(bazis_data) {
    if (!is_entity_valid(bazis_data)) {
        console.warn("bazis_explode aborted: Missing data.");
        return;
    }
    const { AUDIO_KEY, EXPLOSION_IMG_SRC, EXPLOSION_IMG_CLASS, CSS_HEIGHT, ANIM_OPACITY, ANIM_DURATION, 
            ANIM_EASING, Y_OFFSET_PX}
    = BAZIS_CONFIG.EXPLOSION;
    const last_known_rect = bazis_data.rect;
    const { left, top} = last_known_rect; 
    
    audio_play(AUDIO_KEY[0]);

    unified_image_loader( EXPLOSION_IMG_SRC, (bazis_explosion_img)=> {
        bazis_explosion_img.addClass(EXPLOSION_IMG_CLASS);
        bazis_explosion_img.appendTo($("body")).show()
        .css({
            "left":left,
            "top": top - Y_OFFSET_PX,
            "height": CSS_HEIGHT
        });
        bazis_explosion_img.animate({
            opacity: ANIM_OPACITY 
        }, ANIM_DURATION, ANIM_EASING, function () {
            $(this).remove();            
        });
        audio_play(AUDIO_KEY[1]);
    });
}   

/**
 * Executes the terminal sequence when the player (Bazis) loses their final life.
 * 
 * This function finalizes the player's state, triggers the destruction sequence,
 * halts gameplay systems (like enemy traffic), manages audio transitions, and
 * orchestrates the transition to the game-over/score summary screens.
 * 
 * @function bazis_dies
 * @param {Object} bazis_data - The state object representing the player ship.
 * @returns {void}
 * 
 * @description
 * 1. Resets HP and lives to 0 and flags the player as exploding.
 * 2. Invokes `bazis_explode` for the visual destruction effect.
 * 3. Removes the player's DOM element and clears the reference.
 * 4. Disables the regular enemy spawning system via `traffic_flag`.
 * 5. Stops main background music and plays the death theme.
 * 6. If a boss battle is active, forces a `boss_exit`.
 * 7. Displays game-over text and triggers the high-score table.
 * 
 * @see {@link bazis_explode} For the visual explosion logic.
 * @see {@link boss_exit} For cleaning up boss-specific states upon player death.
 * @see {@link show_scores_table} For the final UI transition.
 */
function bazis_dies(bazis_data) {
    if(!is_entity_valid(bazis_data)) return;

    bazis_data.hp = 0;  
    bazis_data.lives = 0;      
    score_dependent_fns();
    bazis_data.is_exploding = true;    
    bazis_explode( bazis_data);
    bazis_data.element.remove();
    bazis_data.element = null;

    game_data.game_states.traffic_flag = false;

    audio_stop(AUDIO_CONFIG.TRACKS.MAIN);
    audio_play(AUDIO_CONFIG.TRACKS.DEATH);

    show_scores_table();      
    if( game_data.game_states.boss_flag )
        {   
        boss_exit();       
        }
        else
        handle_victory_display(BAZIS_CONFIG.DAMAGE.GAME_OVER_TEXT);       
}

/**
 * Processes the transition when the player loses a life but has remaining reserves.
 * 
 * This function decrements the life counter, restores health to maximum, 
 * triggers a visual explosion at the death site, and invokes the reset 
 * sequence to reposition the player ship.
 * 
 * @function bazis_use_next_life
 * @param {Object} bazis_data - The state object for the player ship.
 * @returns {void}
 *  
 * @see {@link bazis_explode} For the visual destruction effect.
 * @see {@link bazis_reset} For the respawn logic.
 */
function bazis_use_next_life(bazis_data) {
    bazis_data.lives--;
    bazis_data.hp = bazis_data.max_hp;
    score_dependent_fns();
    bazis_data.is_exploding = true;
    bazis_explode( bazis_data);
    bazis_reset();  
}

/**
 * Handles the physical and visual reaction of the Bazis (player base) upon collision.
 * 
 * This function calculates a "kick-back" vector based on the center-point difference 
 * between the source and the Bazis, applies damage, and executes a clamped 
 * horizontal or vertical animation to keep the player within the viewport.
 *
 * @param {DOMRect} source_rect - The bounding box of the entity that hit the Bazis (e.g., an Asteroid).
 * @param {Object} bazis_data - The data object for the player base. 
 */
function bazis_feedback_moves(source_rect, bazis_data) {
    if (bazis_data.is_colliding) { return; }
    bazis_data.is_colliding = true;

    bazis_damage( boss_level_entities.asteroid.damage, bazis_data);

    const target_element = bazis_data.element;
    const bazis_rect = bazis_data.rect;
    const {KICK_DISTANCE, DURATION, EASING} = BAZIS_CONFIG.COLLISION;
       
    // Screen boundaries
    const min_x = 0;
    const max_x = window.innerWidth - bazis_rect.width;
    const min_y = 0;
    const max_y = window.innerHeight - bazis_rect.height;

    const source_center_x = source_rect.left + source_rect.width / 2;
    const source_center_y = source_rect.top + source_rect.height / 2;
    const target_center_x = bazis_rect.left + bazis_rect.width / 2;
    const target_center_y = bazis_rect.top + bazis_rect.height / 2;

    const diff_x = target_center_x - source_center_x;
    const diff_y = target_center_y - source_center_y;

    let anim_props = {};

    if (Math.abs(diff_x) > Math.abs(diff_y)) {
        // Horizontal collision: Calculate absolute target and clamp it
        let target_x = diff_x > 0 ? bazis_rect.left + KICK_DISTANCE : bazis_rect.left - KICK_DISTANCE;
        anim_props.left = Math.max(min_x, Math.min(target_x, max_x));
    } else {
        // Vertical collision: Calculate absolute target and clamp it
        let target_y = diff_y > 0 ? bazis_rect.top + KICK_DISTANCE : bazis_rect.top - KICK_DISTANCE;
        anim_props.top = Math.max(min_y, Math.min(target_y, max_y));
    }

    $(target_element).stop(true, false).animate(anim_props, DURATION, EASING, function() {
        // Sync the rect immediately after animation so collision detection is accurate
        bazis_data.rect = target_element[0].getBoundingClientRect();
        bazis_data.is_colliding = false; 
    });
}