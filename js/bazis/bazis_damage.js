function bazis_damage(act_damage, bazis_data)                            // Bazis damage actions
{   
    if( weapons.flags.god_mode ) { return; }

    if (!bazis_data || !bazis_data.element || !bazis_data.rect) {
        return;
    }
    const bazis_element = $(bazis_data.element); 

    base_level_entities.bazis.hp -= act_damage;
    h_points = base_level_entities.bazis.hp;
    
    if( base_level_entities.bazis.lives == 1 && h_points < 1)             //  Dies
        {       
         base_level_entities.bazis.hp = 0;  
         base_level_entities.bazis.lives = 0;      
         score_dependent_fns();
      
        bazis_explode( bazis_data);
        bazis_element.remove();
        base_level_entities.bazis.element = null;
        base_level_entities.bazis.rect = null;                   

        game_data.game_states.traffic_flag = false;

        if( game_data.game_states.boss_flag )
        {   
            boss_exit();       
        }
        update_center_display("Game Over");         
       
        show_scores_table();            
    }     

   else if (h_points < 1 && base_level_entities.bazis.lives > 0) {       //  Use next life
        base_level_entities.bazis.lives--;
        base_level_entities.bazis.hp = base_level_entities.bazis.max_hp;
        score_dependent_fns();

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
    if (!bazis_element || bazis_element.length === 0) return;  
    
    bazis_element.css({ filter: "brightness(1.5) sepia(1) hue-rotate(180deg) saturate(5)" });
    setTimeout(() => {
        if (bazis_element.length > 0) {
            bazis_element.css({ filter: "none" });
        }
    }, 150);

    unified_image_loader("villam1.gif", (lightning_img)=>{
        lightning_img.appendTo(bazis_element).show()
        .css({
            "width": 15,
            "height": 15,
            "position": "absolute",
            "z-index": 20, 
            "left" : 25, 
            "top" : 0            
        });

        lightning_img.animate({
            "width": 120,
            "height": 120,  
            left: -46, 
            top: -15                  
        }, 150, "linear", function () {
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
function bazis_explode(bazis_data) 
{
    if (!bazis_data || !bazis_data.rect || !bazis_data.element) {
        console.warn("bazis_explode aborted: Missing data.");
        return;
    }
    const { left, top, width, height } = bazis_data.rect;    

    audio_play("#robbanas7");   

    unified_image_loader( "robban.gif", (bazis_explosion_img)=> {
        bazis_explosion_img.addClass('robbanas');
        bazis_explosion_img.appendTo($("body")).show()
        .css({
            "left":left ,
            "top": top,
            "height": 270
        });
        bazis_explosion_img.animate({
            opacity: 0.1 
        }, 1300, "linear", function () {
            $(this).remove();            
        });
        audio_play("#powerdwn1");
    });
}   