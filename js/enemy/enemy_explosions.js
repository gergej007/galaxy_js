/**
 * Handles the explosion logic for a given game object, determining its type
 * and performing appropriate actions ( exploding, returning to pool).
 *
 * @param {object} object_data - The data object of the entity that is exploding.
 *                               Expected to contain a 'type' property (e.g., 'enemy', 'missile').
 * @returns {void}
 */                                                 
function explode_spacekraft( object_data )
{       
    if (!object_data || !object_data.element || !object_data.type || !object_data.rect) {
        console.log(`explode_spacekraft called with invalid object_data (type: ${object_data?.type}, element: ${!!object_data?.element}, rect: ${!!object_data?.rect}). Cannot explode.`, object_data);
        if (object_data?.element) {
            object_data.element.remove(); 
        }
        return;
    } 
    
     robbanas_audio();
     let rnd_height, explosion_x, explosion_y;
    // const{ rnd_height, explosion_x, explosion_y } = calculate_explosion_coordinates( object_data.rect);

    switch(object_data.type){
        case 'Enemy' : ({ rnd_height, explosion_x, explosion_y } = calculate_explosion_coordinates( object_data.rect));
                       play_explosion_visual(rnd_height, explosion_x, explosion_y);
                       add_score_n_hit();
                       return_enemy_to_pool( object_data );
                       break;

        case  'Homing Missile': ({ rnd_height, explosion_x, explosion_y } = calculate_explosion_coordinates( object_data.rect));
                      play_explosion_visual(rnd_height, explosion_x, explosion_y);
                      return_homing_missile_to_pool( object_data);
                      break;

        case  'Bounty': ({ rnd_height, explosion_x, explosion_y } = calculate_explosion_coordinates( object_data.rect));
                      play_explosion_visual(rnd_height, explosion_x, explosion_y); 
                      reset_bounty_data( object_data );           
                      break;

        case 'Asteroid': ({ rnd_height, explosion_x, explosion_y } = calculate_explosion_coordinates( object_data.rect));
                      play_explosion_visual(rnd_height, explosion_x, explosion_y);
                      boss_level_entities.asteroid.element.remove();
                      console.log('Asteroid exploded!'); 
                      break;              
        default: console.warn('object_data.type is unidentified!');                      
    }
   
         

    // unified_image_loader( "robban.gif", (act_explosion)=> {
    //     act_explosion.addClass("robbanas")
    //     .appendTo($("body"))
    //     .show().css({
    //         "left": explosion_x,
    //         "top": explosion_y,
    //         "height": rnd_height,
    //         "width" : "auto"
    //     });        
    //     act_explosion.hide(1200, function () { $(this).remove() });                    
    // });
}   

function play_explosion_visual(rnd_height, explosion_x, explosion_y) {
       unified_image_loader( "robban.gif", (act_explosion)=> {
        act_explosion.addClass("robbanas")
        .appendTo($("body"))
        .show().css({
            "left": explosion_x,
            "top": explosion_y,
            "height": rnd_height,
            "width" : "auto"
        });        
        act_explosion.hide(1200, function () { $(this).remove() });                    
    });
}

/**
 * Triggers explosion effects at the location of all destroyed enemy spacekrafts.
 * This function handles the creation, positioning, and animation of the explosion visual,
 * and returns the enemy data object to the pool.
 * Returns active enemy projectiles to pool. 
 * 
 * @returns {void}
 */
function explode_all_spacekrafts() 
{                                    
    audio_play("#robbanas5");
    
    const all_enemy_spacekrafts = base_level_entities.enemy_ships;
    
    all_enemy_spacekrafts.filter( enemy_data => enemy_data.is_active)
    .forEach( enemy_data => {   
        if (!enemy_data || !enemy_data.element || enemy_data.element.length === 0 || !enemy_data.rect) {
            console.warn("explode_spacekraft called without valid enemy_data.");
            return;
        }
        const{ rnd_height, explosion_x, explosion_y} = calculate_explosion_coordinates( enemy_data.rect);       
       
        unified_image_loader("robban.gif", (act_explosion)=>{
            act_explosion.addClass("robbanas")
            .appendTo($("body"))
            .show().css({            
                "height" : rnd_height,  
                "width" : "auto",            
                "left" : explosion_x,
                "top" : explosion_y
            });              
            add_score_n_hit(); 

            return_enemy_to_pool( enemy_data);
            act_explosion.hide(1200, function () { $(this).remove() });  
            });
            
            base_level_entities.enemy_shots.filter( enemy_shot_data => enemy_shot_data.is_active)
                                           .forEach(enemy_shot_data => {
                                            return_enemy_shot_to_pool(enemy_shot_data);
                                            });
    });
}

/**
 * Calculates the dimensions and central coordinates for an explosion effect.
 *
 * @param {DOMRect} enemy_rect - The DOMRect object of the enemy that is exploding.
 * @returns {{rnd_height: number, explosion_x: number, explosion_y: number}} An object containing:
 *   - `rnd_height`: A random height for the explosion visual.
 *   - `explosion_x`: The absolute X-coordinate for the top-left of the explosion div,
 *                    calculated to center it horizontally over the enemy.
 *   - `explosion_y`: The absolute Y-coordinate for the top-left of the explosion div,
 *                    calculated to center it vertically over the enemy.
 */
function calculate_explosion_coordinates( enemy_rect) {
    const rnd_height = Math.round(Math.random() * 100) + 190;    
    const xpoz = enemy_rect.left;
    const ypoz = enemy_rect.top;
    const explosion_x = xpoz + (enemy_rect.width / 2) -50;
    const explosion_y = ypoz + (enemy_rect.height / 2) - (rnd_height / 2);

    return {rnd_height : rnd_height, explosion_x : explosion_x, explosion_y : explosion_y};
}