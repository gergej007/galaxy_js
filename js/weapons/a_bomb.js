function a_bomb_launch() {  
    weapons.flags.a_bomb = true;
     const bazis_rect = base_level_entities.bazis.rect;

    if( !bazis_rect || game_data.counters.a_bomb === 0){
        console.log("A-bomb launch disabled!");
        return;
    }
        game_data.counters.a_bomb--;
    
        audio_play("#abomb1"); 
       
        const a_bomb = $("<div class='bomba'></div>"); 
        
        const poz_x = bazis_rect.left + bazis_rect.width/2 + a_bomb.width();
        const poz_y = bazis_rect.top +20;
        const anim_poz_y = $(window).height() * 0.25;
 
        a_bomb.css({
            "left": poz_x,  
            "top": poz_y 
        });
    
        a_bomb.appendTo($("body"));
 
        a_bomb.animate({
            "top": anim_poz_y, 
            "left": poz_x
        }, 500, "linear",
            function () {
                $(this).remove();
            }
        );
        setTimeout(function () 
        {
            a_bomb_explosion(poz_x);     
        }, 550 );  
}

function a_bomb_explosion(poz_x) {
    unified_image_loader("robban5.gif", (a_explosion_img)=> {
        a_explosion_img.addClass("atombomba").appendTo($("body"))
                        .show()
                        .css({
                            "top": $(window).height() * 0.18, 
                            "left": poz_x - a_explosion_img.width() / 2,
                            "border-radius": 10,
                            "opacity": 0.95
                        });

        base_level_a_bomb_explosion_reactions(500);
        base_level_a_bomb_explosion_reactions(1200);
        if( game_data.game_states.boss_flag && boss_level_entities.boss.element.length > 0){
            boss_a_bomb_reaction();
        }
                    
        audio_play("#abomb3");   
        const anim_poz_x = poz_x - a_explosion_img.width() * 1.4;
        const anim_poz_y = $(window).height() * 0.3 - a_explosion_img.height() * 1.4;                       
        
        a_explosion_img.animate({                           
            "left": anim_poz_x,
            "top": anim_poz_y,
            "width": 770,
            "opacity": 0.92,
            "border-radius": 120
        }, 2700, "linear") 
        .animate({ 
            opacity: 0
        }, 600, function() {            
             $(this).remove(); 
             weapons.flags.a_bomb = false;  
        });
    });
}


function base_level_a_bomb_explosion_reactions(delay) {   
    setTimeout(function () {  
        if( !game_data.game_states.traffic_flag){
            return;
        }     
        
        explode_all_spacekrafts();                                          // Handle enemy spacekrafts                   
               
                                                                            // Handle bounty container
        if( game_data.game_states.bounty_flag && $(base_level_entities.bounty.element).length > 0 ){
            bounty_container_damage(20);
        }
                                                                             // Handle Boss               
        // if ( game_data.game_states.boss_flag && boss_level_entities.boss.element.length > 0) 
        //    {      
               
        //     score_dependent_fns();
         
        //     boss_level_entities.boss.hp -= 25;         //  Ezt itt át kell alakitani
    
        //     boss_a_bomb_reaction();
                
        //     update_progressbar(boss_level_entities.boss.hp);
    
        //     if (boss_level_entities.boss.hp <= 1) {
        //         boss_dies();
        //     }          
        // }            
    }, delay);
}