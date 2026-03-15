function asteroid_bazis_collision_detection() {                                       // Asteroid VS Bazis
    if( !boss_level_entities.asteroid.element || !boss_level_entities.asteroid.rect
        || !base_level_entities.bazis.element || !base_level_entities.bazis.rect ){
        return;
    }

    const asteroid_rect = boss_level_entities.asteroid.rect;   
    const bazis_rect = base_level_entities.bazis.rect;
    const bazis_element = base_level_entities.bazis.element;
    
    if( check_collision( asteroid_rect, bazis_rect))
        {
        bazis_damage( boss_level_entities.asteroid.damage, bazis_rect.left, bazis_rect.top, bazis_rect.width );
        $(bazis_element).animate({
          "top" : bazis_rect.top + 90
          },250);
        }
}

function asteroid_bazis_shots_collision_detection(){                            // Asteroid VS Bazis shots
    if( !boss_level_entities.asteroid.element || !boss_level_entities.asteroid.rect){
        return;
    }

    const asteroid_rect = boss_level_entities.asteroid.rect;

    base_level_entities.bazis_shots.filter(bazis_shot_data => bazis_shot_data.is_active)
    .forEach( bazis_shot_data => {
        const bazis_shot_rect = bazis_shot_data.rect;
        const bazis_shot_element = bazis_shot_data.element;
    
        if ( !bazis_shot_rect || !bazis_shot_element) {
            return;}     

            if( check_collision( bazis_shot_rect, asteroid_rect))
             {               
                dust_animation(bazis_shot_data, asteroid_rect); 
                return_bazis_shot_to_pool(bazis_shot_data);
              }
        });
}

function asteroid_boss_shots_collision_detection(){                                  // Asteroid VS Boss shots
    if( !boss_level_entities.asteroid.element || !boss_level_entities.asteroid.rect){
        return;
    }
    const asteroid_rect = boss_level_entities.asteroid.rect;

    boss_level_entities.boss_shots.filter( boss_shot_data => boss_shot_data.is_active)
    .forEach( boss_shot_data => {
        const boss_shot_rect = boss_shot_data.rect;
        const boss_shot_element = boss_shot_data.element;
    
        if ( !boss_shot_rect || !boss_shot_element) {
            return;} 

            if( check_collision( asteroid_rect, boss_shot_rect))
             {
                dust_animation(boss_shot_data, asteroid_rect);   
                return_boss_shot_to_pool(boss_shot_data);
             }   
    });
}
