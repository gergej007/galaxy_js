async function boss_homing_shooting( number_of_shots, duration, audio_key, interval_ms, shot_style_key) {
    const HOMING_SHOT_CONFIG = BOSS_SHOTS_CONFIG[shot_style_key];
    
        const boss_data = boss_level_entities.boss;
            if (!boss_data || !boss_data.element || boss_data.element.length === 0 
                || !game_data.game_states.boss_flag) {
                console.log("Boss not ready or active to fire homing shots. Skipping boss_fire_2.");
                return;
            }
    
            for (let i = 0; i < number_of_shots; i++) {
                if (!game_data.game_states.boss_flag || boss_data.is_active === false) {
                    console.log("Boss deactivated during shot sequence. Cancelling remaining shots.");
                    break;
                }
                const bazis_data = validate_bazis_presence();
                if (!bazis_data) {
                    console.warn("Bazis not present for homing shot target. Skipping remaining shots.");
                    break;
                }
                const bazis_rect = bazis_data.rect;
                const boss_rect = boss_data.rect;
    
                const boss_shot_data = get_boss_shot_from_pool();
                if (!boss_shot_data) {
                    console.log("Boss homing shot pool exhausted! Cannot launch homing shot.");
                    break; // Stop if pool is empty
                }
                const boss_shot_element = boss_shot_data.element;
                boss_shot_element.removeClass(Object.values(window.BOSS_SHOTS_CONFIG)
                .map(s => s.CLASS).join(' '));
    
                boss_shot_element.addClass(HOMING_SHOT_CONFIG.CLASS);
    
                boss_shot_data.damage = HOMING_SHOT_CONFIG.DAMAGE;
                boss_shot_data.type = HOMING_SHOT_CONFIG.TYPE;
                boss_shot_data.rect = null; 
    
                 const shot_initial_x = boss_rect.left + boss_rect.width / 2;
                 const shot_initial_y = boss_rect.top + boss_rect.height * HOMING_SHOT_CONFIG.INITIAL_OFFSET_Y; 
    
                 const shot_target_x = bazis_rect.left + bazis_rect.width / 2;
                 const shot_target_y = bazis_rect.top + bazis_rect.height / 2;            
    
                 audio_play(audio_key); 
    
                //  boss_shot_element.css(HOMING_SHOT_CONFIG.BASE_STYLE);
                 boss_shot_element.css({
                    ...HOMING_SHOT_CONFIG.BASE_STYLE,
                    "left": shot_initial_x,
                    "top": shot_initial_y,
                    "display": "block",
                    "opacity": 1,  
                });
        
                boss_shot_element.animate({
                    "top": shot_target_y,
                    "left": shot_target_x
                }, duration, "linear", function() {
                    if(boss_shot_data.is_active){
                        return_boss_shot_to_pool(boss_shot_data);                
                        homing_shot_explosion(shot_target_y, shot_target_x);
                    }
                });  
                await new Promise(resolve => setTimeout(resolve, interval_ms));  
            }
    }

    
function homing_shot_explosion(ypoz, xpoz)
{
    const EXPLOSION_CONFIG = BOSS_SHOTS_CONFIG.HOMING_SHOT_EXPLOSION;
    if( ypoz >= $(window).height() * EXPLOSION_CONFIG.DISTANCE_FROM_SCREEN_BOTTOM) {
        return;
    }
    unified_image_loader('robban3.gif', (blue_explosion_img)=> {
        blue_explosion_img.addClass('blue_robbanas')
        .appendTo($("body"))        
        .css({
            "left": xpoz,
            "top":ypoz               
        })
        .show();
       
        blue_explosion_img.animate({
            "width": EXPLOSION_CONFIG.ANIM_X,
            "height" : EXPLOSION_CONFIG.ANIM_Y
        }, EXPLOSION_CONFIG.ANIM_DURATION, function(){
            $(this).remove();
        });   
    });   
}