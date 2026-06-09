/**
 * Handles the explosion logic for a given game object, determining its type
 * and performing appropriate actions ( exploding, returning to pool).
 *
 * @param {object} object_data - The data object of the entity that is exploding.
 *                               Expected to contain a 'type' property (e.g., 'enemy', 'missile').
 * @returns {void}
 */                                                 
function explode_spacekraft( object_data ) {
       
    const { ENEMY_TYPE, HOMING_MISSILE_TYPE, BOUNTY_TYPE, ASTEROID_TYPE} = DAMAGE_N_EXPLOSION;

    if( !is_entity_valid(object_data) || !object_data.type){
        console.warn(`explode_spacekraft: Invalid object_data`, object_data);
        object_data?.element?.remove();     
        return;
    } 
    
     robbanas_audio();
     const { rnd_height, explosion_x, explosion_y } = calculate_explosion_coordinates(object_data.rect);
     play_explosion_visual(rnd_height, explosion_x, explosion_y);

    switch(object_data.type){
        case ENEMY_TYPE :                      
                       add_score_n_hit();
                       return_enemy_to_pool( object_data );
                       break;

        case  HOMING_MISSILE_TYPE: 
                      return_homing_missile_to_pool( object_data);
                      break;

        case  BOUNTY_TYPE: 
                      reset_bounty_data( object_data );           
                      break;

        case ASTEROID_TYPE: 
                      object_data.element.remove();
                      break;              
        default: console.warn(`Unknown object type: ${object_data.type}`);                      
    }
}   

/**
 * Creates and animates a single explosion visual effect at the specified coordinates.
 * 
 * @function play_explosion_visual
 * @param {number} rnd_height - The randomized height/scale of the explosion.
 * @param {number} explosion_x - The horizontal center-point for the explosion.
 * @param {number} explosion_y - The vertical center-point for the explosion.
 * @returns {void}
 * 
 * @description
 * 1. Loads the explosion image asset using the unified loader.
 * 2. Appends the explosion element to the document body.
 * 3. Sets the position and size based on the provided coordinates.
 * 4. Schedules the element to be hidden and removed from the DOM after HIDE_DURATION_MS.
 */
function play_explosion_visual(rnd_height, explosion_x, explosion_y) {
    const { IMG_SRC, IMG_CLASS, HIDE_DURATION_MS} = DAMAGE_N_EXPLOSION;

       unified_image_loader( IMG_SRC, (act_explosion)=> {
        act_explosion.addClass(IMG_CLASS)
        .appendTo($("body"))
        .show().css({
            "left": explosion_x,
            "top": explosion_y,
            "height": rnd_height,
            "width" : "auto"
        });        
        act_explosion.hide(HIDE_DURATION_MS, function () { $(this).remove() });                    
    });
}

/**
 * Triggers a mass explosion effect for all currently active enemies and clears active projectiles.
 * 
 * This function iterates through all active enemy ships, calculates and plays individual 
 * explosion visuals for each, updates the player score, and recycles both the ships 
 * and their projectiles back into their respective pools.
 * 
 * @function explode_all_spacekrafts
 * @returns {void} 
 */
function explode_all_spacekrafts() {
                
    const all_enemy_spacekrafts = base_level_entities.enemy_ships;
    audio_play(DAMAGE_N_EXPLOSION.AUDIO_KEY);

    all_enemy_spacekrafts.filter( enemy_data => enemy_data.is_active)
    .forEach( enemy_data => {   
        if (!is_entity_valid(enemy_data)) {
            console.warn("explode_spacekraft called without valid enemy_data.");
            return;
        }
    const{ rnd_height, explosion_x, explosion_y} = calculate_explosion_coordinates( enemy_data.rect);       
       
    play_explosion_visual( rnd_height, explosion_x, explosion_y);
             
    add_score_n_hit(); 

    return_enemy_to_pool( enemy_data);
    });
            
    base_level_entities.enemy_shots.filter( enemy_shot_data => enemy_shot_data.is_active)
                                    .forEach(enemy_shot_data => {
                                    return_enemy_shot_to_pool(enemy_shot_data);
                                    });   
}

/**
 * Calculates the visual coordinates for an explosion effect based on the target's position.
 * 
 * @param {Object} enemy_rect - The bounding box of the entity that exploded.
 * @returns {Object} An object containing the calculated height and coordinates.
 */
function calculate_explosion_coordinates( enemy_rect) {
    const { RND_HEIGHT_MULTIPLIER, RND_HEIGHT_SEED, HORIZONTAL_OFFSET_PX} = DAMAGE_N_EXPLOSION;
    const rnd_height = RANDOM_PROVIDER.get_in_range(RND_HEIGHT_MULTIPLIER, RND_HEIGHT_SEED);   
    const xpoz = enemy_rect.left;
    const ypoz = enemy_rect.top;
    const explosion_x = xpoz + (enemy_rect.width / 2) - HORIZONTAL_OFFSET_PX;
    const explosion_y = ypoz + (enemy_rect.height / 2) - (rnd_height / 2);

    return { rnd_height, explosion_x, explosion_y};
}