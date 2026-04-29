function bazis_damage(act_damage, bazis_data)                            // Bazis damage actions
{   
    if( weapons.flags.god_mode ) { return; }

    if (!is_entity_valid(bazis_data) || bazis_data.is_exploding) {
        return;
    }
    const bazis_element = $(bazis_data.element); 

    base_level_entities.bazis.hp -= act_damage;
    h_points = base_level_entities.bazis.hp;         
    
    if( base_level_entities.bazis.lives === 1 && h_points < 1)             //  Dies
        {       
        base_level_entities.bazis.hp = 0;  
        base_level_entities.bazis.lives = 0;      
        score_dependent_fns();
        base_level_entities.bazis.is_exploding = true;    
        bazis_explode( bazis_data);
        bazis_element.remove();
        base_level_entities.bazis.element = null;
        // base_level_entities.bazis.rect = null;                   

        game_data.game_states.traffic_flag = false;

        if( game_data.game_states.boss_flag )
        {   
            boss_exit();       
        }
        update_center_display(BAZIS_CONFIG.DAMAGE.GAME_OVER_TEXT);         
       
        show_scores_table();            
    }     

   else if (h_points < 1 && base_level_entities.bazis.lives > 0) {       //  Use next life
        base_level_entities.bazis.lives--;
        base_level_entities.bazis.hp = base_level_entities.bazis.max_hp;
        score_dependent_fns();
        base_level_entities.bazis.is_exploding = true;
        bazis_explode( bazis_data);
        bazis_reset();      
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
    const {KICK_DISTANCE, DURATION} = BAZIS_CONFIG.COLLISION;
       
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

    $(target_element).stop(true, false).animate(anim_props, DURATION, function() {
        // Sync the rect immediately after animation so collision detection is accurate
        bazis_data.rect = target_element[0].getBoundingClientRect();
        bazis_data.is_colliding = false; 
    });
}