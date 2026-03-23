function spacekraft_shot( enemy_data) {
    const first_shot_delay = Math.round( Math.random() * 700) + 250 ;  
    const bazis = $(base_level_entities.bazis.element);
    const bazis_rect = base_level_entities.bazis.rect;     

    setTimeout( ()=> {                                
          
    const enemy_element = $(enemy_data.element);
    const enemy_rect = enemy_data.rect;
    
    if (!enemy_element || enemy_element.length === 0 || !enemy_rect || !bazis || bazis.length === 0){
            return;
        }  
       
    const b_xpoz = bazis_rect.left;
    const b_ypoz = bazis_rect.top;
    const b_width = bazis_rect.width;
    const b_height = bazis_rect.height;
    const s_xpoz = enemy_rect.left;
    const s_bottom = enemy_rect.bottom;
    const s_width = enemy_rect.width;
    
    // Bazis target X , Y
    let bazis_target_x = b_xpoz + b_width / 2;
    let bazis_target_y = b_ypoz + b_height / 4;
    
    const shot_initial_x = Math.round(s_xpoz + s_width / 2); 
    const shot_initial_y = s_bottom;                

    if (b_ypoz <= s_bottom) {                               // If Bazis is above enemy
        bazis_target_x = shot_initial_x; 
        bazis_target_y = $(window).height();   
    }    

    const enemy_shot_data = get_enemy_shot_from_pool();
    const enemy_shot_element = enemy_shot_data.element;
    if( !enemy_shot_data || !enemy_shot_element || enemy_shot_element.length === 0){
        console.log("enemy shot dropped due to invalid shot data!");
        return;
    }
    enemy_shot_data.shooter_id = enemy_data.id;
    
    const is_vertically_clear = (s_bottom < $(window).height() -( b_height + 70));  
    const is_horizontally_in_range =
        (enemy_data.moving_direction === "moving_right" && s_xpoz > -s_width && s_xpoz < $(window).width() - 200) || 
        (enemy_data.moving_direction === "moving_left" && s_xpoz < $(window).width() && s_xpoz > 200);                  
                       
    if (is_vertically_clear && is_horizontally_in_range) 
    {
        enemy_shot_element.hide();
        enemy_shot_element.appendTo($("body"));
        enemy_shot_element.css({
            "left": shot_initial_x,
            "top": shot_initial_y,
            "position" : "absolute"
        });                             
                
        projectile_selector( enemy_data, s_xpoz, enemy_shot_data, s_bottom, bazis_target_x, bazis_target_y, shot_initial_x );       
    }
    const {frequency_multiplier_projectile, frequency_seed_projectile } = current_level_config;
    
    if( enemy_element && enemy_element.length > 0 && enemy_element.is(':visible')){
          let frequency = Math.round(Math.random() * frequency_multiplier_projectile) + frequency_seed_projectile;
          setTimeout(function () { 
            spacekraft_shot( enemy_data ); }, frequency);  
        }
    }, first_shot_delay); 
}

function projectile_selector( enemy_data, s_xpoz, shot_data, s_bottom, bazis_target_x, bazis_target_y ) {    

    if (!shot_data || !shot_data.element) {
        console.warn("Projectile selector called with invalid shot data.");
        return; 
    }
    const shot_element = $(shot_data.element);
    const {speed_multiplier_projectile, speed_seed_projectile} = current_level_config;
    const rnd_speed = Math.round(Math.random() * (speed_multiplier_projectile * ($(window).height()-s_bottom))) + speed_seed_projectile;
    const rnd_shot_type = Math.round(Math.random() * 3);
 
    const parent_direction = enemy_data.moving_direction;            
    let final_target_x;                                              
    let final_target_y;    
    let animation_easing = "linear";     

    const slide_value = parent_direction === "moving_right" ? 100 : -100;
    const slide_ammount_px = parseInt(( enemy_data.speed / $(window).width() ) * slide_value);     

    lazer_audio();

    switch (rnd_shot_type) {
        case 0:                                             // Case 0: Target bazis
            shot_element.addClass("counter_tuz_var0");
            final_target_x = bazis_target_x;
            final_target_y = bazis_target_y;
            break;         

        case 1:
            shot_element.addClass("counter_tuz_var1");      // Case 1: Untargeted projectile            
            final_target_x  = s_xpoz + slide_ammount_px; 
            final_target_y =  $(window).height();                
            break;           

        case 2:                                           // case 2 :Target bazis 
            shot_element.addClass("counter_tuz_var2");
            final_target_x = bazis_target_x;
            final_target_y = bazis_target_y;
            break;           

        case 3:
            shot_element.addClass("counter_tuz_var3");      // Case 4: Untargeted projectile           
            final_target_x  = s_xpoz + slide_ammount_px;
            final_target_y = $(window).height();           
            break;             
        }

        shot_element.show();   

        shot_element.animate({
            "top": final_target_y,
            "left": final_target_x
        }, rnd_speed , animation_easing, function () {
            return_enemy_shot_to_pool( shot_data);         
        });  
}