function asteroid_bazis_collision_detection() {                                       // Asteroid VS Bazis
    const bazis_data = base_level_entities.bazis;
    const asteroid_data = boss_level_entities.asteroid;
    if (!is_entity_valid(asteroid_data) || !is_entity_valid(bazis_data)) {
        return;
    }

    const asteroid_rect = asteroid_data.rect;   
    const bazis_rect = bazis_data.rect;
    
    if( check_collision( asteroid_rect, bazis_rect))
        {
        bazis_feedback_moves(asteroid_rect, bazis_data);    //   <- Damage there      
        }       
}

function asteroid_bazis_shots_collision_detection(){                            // Asteroid VS Bazis shots
  
    if (!is_entity_valid(boss_level_entities.asteroid)) {
        return;
    }


    const asteroid_rect = boss_level_entities.asteroid.rect;

    base_level_entities.bazis_shots.filter(bazis_shot_data => bazis_shot_data.is_active)
    .forEach( bazis_shot_data => {
        if (!is_entity_valid(bazis_shot_data)) {
            return;
        }
        const bazis_shot_rect = bazis_shot_data.rect;      

            if( check_collision( bazis_shot_rect, asteroid_rect))
             {               
                dust_animation(bazis_shot_data, asteroid_rect); 
                return_bazis_shot_to_pool(bazis_shot_data);
              }
        });
}

/**
 * Detects and handles collisions between the Asteroid and Boss projectiles.
 * 
 * Iterates through all active boss shots and checks for intersection with the 
 * asteroid's bounding box. Upon collision, it triggers a visual dust effect 
 * and recycles the projectile back to the pool.
 * 
 * @function asteroid_boss_shots_collision_detection
 * @returns {void}
 */
function asteroid_boss_shots_collision_detection(){                                  // Asteroid VS Boss shots
  
    if (!is_entity_valid(boss_level_entities.asteroid)) {
        return;
    }
    const asteroid_rect = boss_level_entities.asteroid.rect;

    boss_level_entities.boss_shots.filter( boss_shot_data => boss_shot_data.is_active)
    .forEach( boss_shot_data => {
        if(!is_entity_valid(boss_shot_data)){
            return;
        }
        const boss_shot_rect = boss_shot_data.rect;          

            if( check_collision( asteroid_rect, boss_shot_rect))
             {
                dust_animation(boss_shot_data, asteroid_rect); 
                if (boss_shot_data.type === 'Boss Twin Lazer') {
                    // Flag it so the laser shooting function knows to stop growing/lingering
                    boss_shot_data.has_hit = true; 
                    boss_shot_data.is_active = false; // Stop further collision checks
                }
                else {
                   return_boss_shot_to_pool(boss_shot_data); 
                }
                  
                
             }   
    });
}
