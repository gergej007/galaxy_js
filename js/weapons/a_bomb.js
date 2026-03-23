/**
 * Initiates the launch sequence for an A-Bomb from the player's bazis.
 * This function handles the creation and animation of the bomb projectile,
 * deducting one A-bomb from the player's inventory, and scheduling its subsequent explosion.
 *
 * @returns {void}
 */
function a_bomb_launch() { 
    
    const { AUDIO_KEYS, BOMB_CLASS, LAUNCH_OFFSET_Y, DESTINATION_FACTOR_Y,
            ANIMATION_DURATIONS, EASING, EXPLOSION_TIMEOUT_MS } = SECONDARY_WEAPONS_CONFIG.A_BOMB;

    weapons.flags.a_bomb = true;
     const bazis_rect = base_level_entities.bazis.rect;

    if( !bazis_rect || game_data.counters.a_bomb === 0){
        console.log("A-bomb launch disabled!");
        return;
    }
        game_data.counters.a_bomb--;
    
        audio_play( AUDIO_KEYS[0] ); 
       
        const a_bomb = $(`<div class=${BOMB_CLASS}></div>`); 
        
        const poz_x = bazis_rect.left + bazis_rect.width/2 + a_bomb.width();
        const poz_y = bazis_rect.top + LAUNCH_OFFSET_Y;
        const anim_poz_y = $(window).height() * DESTINATION_FACTOR_Y;
 
        a_bomb.css({
            "left": poz_x,  
            "top": poz_y 
        });
    
        a_bomb.appendTo($("body"));
 
        a_bomb.animate({
            "top": anim_poz_y, 
            "left": poz_x
        }, ANIMATION_DURATIONS[0], EASING,
            function () {
                $(this).remove();
            }
        );
        setTimeout(function () 
        {
            a_bomb_explosion(poz_x);     
        }, EXPLOSION_TIMEOUT_MS );  
}

/**
 * Manages the visual and environmental reactions of an A-Bomb explosion.
 * This function loads the explosion image, positions it, triggers visual animations,
 * plays explosion audio, initiates game-state reactions, and handles the cleanup
 * of the explosion visual. It leverages the A_BOMB configuration for all its parameters.
 *
 * @param {number} poz_x - The X-coordinate where the explosion should be centered.
 *                         This is typically the landing spot of the A-bomb projectile.
 * @returns {void}
 */
function a_bomb_explosion(poz_x) {

    const { EXPLOSION_IMG_SRC, EXPLOSION_IMG_CLASS, INITIAL_TOP_Y_FACTOR, BASE_STYLE, AUDIO_KEYS,       
            EXP_REACTIOM_DELAYS, EXP_ANIM_FACTOR_X_Y, EXP_ANIM_FACTOR_Y, ANIMATION_PROPERTIES,
            ANIMATION_DURATIONS, EASING } = SECONDARY_WEAPONS_CONFIG.A_BOMB;

    unified_image_loader( EXPLOSION_IMG_SRC, (a_explosion_img)=> {
        a_explosion_img.addClass(EXPLOSION_IMG_CLASS).appendTo($("body"))
                        .show()
                        .css({
                            ...BASE_STYLE,
                            "top": $(window).height() * INITIAL_TOP_Y_FACTOR, 
                            "left": poz_x - a_explosion_img.width() / 2                           
                        });

        base_level_a_bomb_explosion_reactions( EXP_REACTIOM_DELAYS[0]);
        base_level_a_bomb_explosion_reactions( EXP_REACTIOM_DELAYS[1]);
        if( game_data.game_states.boss_flag && boss_level_entities.boss.element.length > 0){
            boss_a_bomb_reaction();
        }
                    
        audio_play( AUDIO_KEYS[1] );   
        const anim_poz_x = poz_x - a_explosion_img.width() * EXP_ANIM_FACTOR_X_Y;
        const anim_poz_y = $(window).height() * EXP_ANIM_FACTOR_Y - a_explosion_img.height() * EXP_ANIM_FACTOR_X_Y;                       
        
        a_explosion_img.animate({ 
            ...ANIMATION_PROPERTIES,                          
            "left": anim_poz_x,
            "top": anim_poz_y            
        }, ANIMATION_DURATIONS[1], EASING) 
        .animate({ 
            opacity: 0
        }, ANIMATION_DURATIONS[2], function() {            
             $(this).remove(); 
             weapons.flags.a_bomb = false;  
        });
    });
}

/**
 * Initiates various game reactions following an A-bomb explosion after a specified delay.
 * These reactions include destroying all active enemy spacekrafts and potentially damaging
 * the bounty container if it is present and active. The function checks for game state flags
 * to ensure reactions only occur if the game is in a traffic-enabled state.
 *
 * It uses configuration values from `SECONDARY_WEAPONS_CONFIG.A_BOMB` for damage calculation.
 *
 * @param {number} delay - The delay in milliseconds before the explosion reactions are triggered.
 * @returns {void}
 */
function base_level_a_bomb_explosion_reactions(delay) {   
    setTimeout(function () {  
        if( !game_data.game_states.traffic_flag){
            return;
        }     
        
        explode_all_spacekrafts();                                          // Handle enemy spacekrafts                   
               
                                                                            // Handle bounty container
        if( game_data.game_states.bounty_flag && $(base_level_entities.bounty.element).length > 0 ){
            bounty_container_damage( SECONDARY_WEAPONS_CONFIG.A_BOMB.A_BOMB_DAMAGE );
        }
                                                                  
    }, delay);
}