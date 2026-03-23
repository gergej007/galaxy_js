function bazis_shots_enemy_collision_detection()                       
{
    base_level_entities.bazis_shots.filter( 
        bazis_shot_data => bazis_shot_data.is_active)
        .forEach ( bazis_shot_data => {

        if( !bazis_shot_data.rect || !bazis_shot_data.element){
            console.warn("Invalid bazis shot data in pool:", bazis_shot_data);
            return;
        }

        const bazis_shot_rect = bazis_shot_data.rect;       

        base_level_entities.enemy_ships.filter(
            enemy_data => enemy_data.is_active)
            .forEach( enemy_data => {
            if( !enemy_data.rect || !enemy_data.element){
                return;
            }                                   

            const enemy_ship_rect =  enemy_data.rect;

            if(  check_collision(bazis_shot_rect, enemy_ship_rect))
                {                  
                enemy_damage( enemy_data, bazis_shot_data.damage);  
                if(bazis_shot_data.type != 'single_lazer' && bazis_shot_data.type != 'dual_lazer') {                                                    
                    return_bazis_shot_to_pool( bazis_shot_data );
                }
            }
        });
    });
}

function bazis_shots_enemy_collision_detection() {
    base_level_entities.bazis_shots.filter(
        bazis_shot_data => bazis_shot_data.is_active && (bazis_shot_data.type === 'single_lazer' || bazis_shot_data.type === 'dual_lazer' || bazis_shot_data.type === 'single' || bazis_shot_data.type === 'dual')) // Only process primary shots
        .forEach(bazis_shot_data => {

            if (!bazis_shot_data.rect || !bazis_shot_data.element) {
                console.warn("Invalid bazis shot data in pool:", bazis_shot_data);
                return;
            }

            const bazis_shot_rect = bazis_shot_data.rect;

            base_level_entities.enemy_ships.filter(
                enemy_data => enemy_data.is_active)
                .forEach(enemy_data => {
                    if (!enemy_data.rect || !enemy_data.element) {
                        return;
                    }

                    const enemy_ship_rect = enemy_data.rect;

                    if (check_collision(bazis_shot_rect, enemy_ship_rect)) {
                        // --- Collision detected ---

                        // Check if this is a lazer shot and apply piercing logic
                        if (bazis_shot_data.type === 'single_lazer' || bazis_shot_data.type === 'dual_lazer') {
                            // Only damage if this lazer hasn't hit this specific enemy before
                            // AND it still has piercing hits remaining
                            if (!bazis_shot_data.enemies_hit_ids.has(enemy_data.id) /*&& bazis_shot_data.pierce_count_remaining > 0*/) {
                                enemy_damage(enemy_data, bazis_shot_data.damage);
                                bazis_shot_data.enemies_hit_ids.add(enemy_data.id); // Mark this enemy as hit by this lazer
                                //bazis_shot_data.pierce_count_remaining--; // Decrement pierce count

                                // Optional: If pierce_count_remaining drops to 0, stop damage or destroy lazer
                               // if (bazis_shot_data.pierce_count_remaining <= 0) {
                                    // If you want the lazer to stop damaging after its pierce count is exhausted
                                    // but still visually continue, you don't need to return it here.
                                    // Just ensure further damage checks for this lazer will fail.
                              //  }
                            }
                            // Important: For lazers, DO NOT return to pool here.
                            // The animation's own callback handles returning it when it goes off-screen.
                        } else {
                            // For all NON-LAZER shots, return to pool immediately on hit.
                            enemy_damage(enemy_data, bazis_shot_data.damage); // Apply damage before returning
                            return_bazis_shot_to_pool(bazis_shot_data);
                        }
                    }
                });
        });
}


function bazis_enemy_shots_collision_detection()
{
    const bazis_data = base_level_entities.bazis;
    if ( !bazis_data.element || !bazis_data.rect) {        
        return; 
    }
    const bazis_rect = bazis_data.rect;  

    base_level_entities.enemy_shots.filter( enemy_shot_data => enemy_shot_data.is_active)
    .forEach( enemy_shot_data => {
    const enemy_shot_rect = enemy_shot_data.rect;
    const enemy_shot_element = $(enemy_shot_data.element);
    const damage_ammount = enemy_shot_data.damage;

    if ( !enemy_shot_rect || !enemy_shot_element) {
        return;}           

        if( check_collision( enemy_shot_rect, bazis_rect))    
          {                     
            return_enemy_shot_to_pool( enemy_shot_data); 
            bazis_damage( damage_ammount, bazis_data);            
        }     
    }); 
}

function bazis_enemy_collision_detection()                                           // Bazis VS Enemy
{
    const bazis_data = base_level_entities.bazis;
    if ( !bazis_data.element || !bazis_data.rect) {        
        return; 
    }
    const bazis_rect = bazis_data.rect;
    const bazis_element = $(bazis_data.element);   

    base_level_entities.enemy_ships.filter( enemy_data => enemy_data.is_active)
    .forEach( enemy_data => {
        const enemy_element = $(enemy_data.element);
        const enemy_rect = enemy_data.rect;
        const damage_ammount = enemy_data.damage;

        if( !enemy_element || ! enemy_rect){
            return;
        }                                                           
            if ( check_collision( enemy_rect, bazis_rect))
            {                                                                   
                explode_spacekraft( enemy_data );

                bazis_element.animate({
                    "top" : bazis_rect.top + 40
                }, 200);
                bazis_damage(damage_ammount, bazis_data);           
                
                add_score_n_hit();
            }
    });
}

function bazis_shot_enemy_shot_collision_detection(){
    base_level_entities.bazis_shots.filter( bazis_shot_data => bazis_shot_data.is_active)
    .forEach( bazis_shot_data => {

        if( !bazis_shot_data.rect || !bazis_shot_data.element){
            return;
        }
        const bazis_shot_rect = bazis_shot_data.rect;
        
        base_level_entities.enemy_shots.filter( enemy_shot_data => enemy_shot_data.is_active)
        .forEach( enemy_shot_data => {

            if( !enemy_shot_data.rect || !enemy_shot_data.element){
                return;
            }
            const enemy_shot_rect = enemy_shot_data.rect;

            if( check_collision(bazis_shot_rect, enemy_shot_rect))
                {
                shots_explosion_lightning( bazis_shot_rect.left, bazis_shot_rect.top);
                return_bazis_shot_to_pool( bazis_shot_data);
                return_enemy_shot_to_pool( enemy_shot_data)
            }
        });
    }); 
}
