function bazis_shots_enemy_collision_detection() {                     // Bazis shots VS enemy
    base_level_entities.bazis_shots.filter(
        bazis_shot_data => bazis_shot_data.is_active && (bazis_shot_data.type === 'single_lazer' || bazis_shot_data.type === 'dual_lazer' || bazis_shot_data.type === 'single' || bazis_shot_data.type === 'dual')) // Only process primary shots
        .forEach(bazis_shot_data => {

            if (!is_entity_valid(bazis_shot_data)) {
                console.warn("Invalid bazis shot data in pool:", bazis_shot_data);
                return;
            }

            const bazis_shot_rect = bazis_shot_data.rect;

            base_level_entities.enemy_ships.filter(
                enemy_data => enemy_data.is_active)
                .forEach(enemy_data => {
                    if (!is_entity_valid(enemy_data)) {
                        return;
                    }

                    const enemy_ship_rect = enemy_data.rect;

                    if (check_collision(bazis_shot_rect, enemy_ship_rect)) {

                        // Check if this is a lazer shot and apply piercing logic
                        if (bazis_shot_data.type === 'single_lazer' || bazis_shot_data.type === 'dual_lazer') {
                            // Only damage if this lazer hasn't hit this specific enemy before
                            
                            if (!bazis_shot_data.enemies_hit_ids.has(enemy_data.id) ) {
                                enemy_damage(enemy_data, bazis_shot_data.damage);
                                bazis_shot_data.enemies_hit_ids.add(enemy_data.id); // Mark this enemy as hit by this lazer
                            }
                            //  lazers -> DO NOT return to pool here.
                        } else {
                            // For all NON-LAZER shots, return to pool immediately on hit.
                            enemy_damage(enemy_data, bazis_shot_data.damage); 
                            return_bazis_shot_to_pool(bazis_shot_data);
                        }
                    }
                });
        });
}


function bazis_enemy_shots_collision_detection() {                      // Bazis VS Enemy Shots

    const bazis_data = base_level_entities.bazis;
    if ( !is_entity_valid(bazis_data)) {  
        return; 
    }
    const bazis_rect = bazis_data.rect;  

    base_level_entities.enemy_shots.filter( enemy_shot_data => enemy_shot_data.is_active)
    .forEach( enemy_shot_data => {
    const enemy_shot_rect = enemy_shot_data.rect;
    const damage_ammount = enemy_shot_data.damage;

    if ( !is_entity_valid(enemy_shot_data)) {
        console.warn("Invalid enemy shot data in pool:", enemy_shot_data);
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
    if ( !is_entity_valid(bazis_data)) {        
        return; 
    }
    const bazis_rect = bazis_data.rect;
    const bazis_element = $(bazis_data.element);   

    base_level_entities.enemy_ships.filter( enemy_data => enemy_data.is_active)
    .forEach( enemy_data => {
        
        if( !is_entity_valid(enemy_data)){
            console.warn("Invalid enemy data in pool:", enemy_data);
            return;
        }                                                           
        const enemy_rect = enemy_data.rect;
        const damage_ammount = enemy_data.damage;

        if ( check_collision( enemy_rect, bazis_rect))
        {                                                                   
            explode_spacekraft( enemy_data );

            bazis_element.animate({                  // Bazis kick back
                "top" : bazis_rect.top + COLLISION_CONFIG.BAZIS_KICK_BACK_y_OFFSET
            }, COLLISION_CONFIG.ANIM_DURATION);

            bazis_damage(damage_ammount, bazis_data);           
                
            add_score_n_hit();
        }
    });
}

function bazis_shot_enemy_shot_collision_detection(){                    // Bazis Shot VS Enemy Shot
    base_level_entities.bazis_shots.filter( bazis_shot_data => bazis_shot_data.is_active)
    .forEach( bazis_shot_data => {

        if( !is_entity_valid(bazis_shot_data)){
            console.warn("Invalid bazis shot data in pool:", bazis_shot_data);
            return;
        }
        const bazis_shot_rect = bazis_shot_data.rect;
        
        base_level_entities.enemy_shots.filter( enemy_shot_data => enemy_shot_data.is_active)
        .forEach( enemy_shot_data => {

            if( !is_entity_valid(enemy_shot_data)){
                console.warn("Invalid enemy shot data in pool:", enemy_shot_data);
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
