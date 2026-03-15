function bazis_container_collision() {                                             // Container VS Bazis
    const bazis_data = base_level_entities.bazis;
    const container_data = base_level_entities.bounty;
   
    if ( !bazis_data.element || !bazis_data.rect
        || !container_data.element  || !container_data.rect) {        
        return; 
    }
    
    const bazis_rect = bazis_data.rect;  
    const bazis_element = $(bazis_data.element);  
    const container_rect = base_level_entities.bounty.rect;  

    if ( check_collision( bazis_rect, container_rect))
        {
        bazis_element.animate({
            "top" : bazis_rect.top + 40
        }, 200);

        bounty_container_damage( (base_level_entities.bazis.damage * 2));       
                                                                       
        bazis_damage( base_level_entities.bounty.damage, bazis_data);
    }
}

function bazis_shots_container_collision_detection() {                         // Container VS Bazis shots
    if( !base_level_entities.bounty.element  || !base_level_entities.bounty.rect) {
        return;
    }
    const container_rect = base_level_entities.bounty.rect;

    base_level_entities.bazis_shots.filter(bazis_shot_data => bazis_shot_data.is_active)
    .forEach( bazis_shot_data => {
        const bazis_shot_rect = bazis_shot_data.rect;

        if( !bazis_shot_rect) { return; }

        if( check_collision( container_rect, bazis_shot_rect))
            {
            bounty_container_damage( bazis_shot_data.damage);    
            return_bazis_shot_to_pool( bazis_shot_data);             
        }
    });
}

function enemy_shots_container_collision_detection() {                         //  Container catch enemy shots
    if( !base_level_entities.bounty.element  || !base_level_entities.bounty.rect) {
        return;
    }
    const container_rect = base_level_entities.bounty.rect;

    base_level_entities.enemy_shots.filter( enemy_shot_data => enemy_shot_data.is_active)
    .forEach( enemy_shot_data => {
        const enemy_shot_rect = enemy_shot_data.rect;

        if( !enemy_shot_rect) { return; }
        if( check_collision( container_rect, enemy_shot_rect))
            {
                return_enemy_shot_to_pool( enemy_shot_data);
            }
    });
}

function bazis_powerup_collision_detection() {                                    // PowerUp vs Bazis
    if(   !base_level_entities.bazis.element || !base_level_entities.bazis.rect
       || !base_level_entities.powerup.element || !base_level_entities.powerup.rect) {
        return;
       }

    const bazis_rect = base_level_entities.bazis.rect;
    const powerup_rect = base_level_entities.powerup.rect;
    const powerup_element = $(base_level_entities.powerup.element);
   
    if( check_collision( bazis_rect, powerup_rect)) 
        {                                                                    
            pick_up_powerup( powerup_element);                
        }   
}
