function bazis_container_collision() {                                             // Container VS Bazis
    const bazis_data = base_level_entities.bazis;
    const bounty_data = base_level_entities.bounty;
   
    if ( !is_entity_valid(bazis_data) ||!is_entity_valid(bounty_data)) { 
        return; 
    }
    
    const bazis_rect = bazis_data.rect;  
    const bazis_element = $(bazis_data.element);  
    const bounty_rect = bounty_data.rect;  

    if ( check_collision( bazis_rect, bounty_rect))
        {
        const { BAZIS_KICK_BACK_y_OFFSET, ANIM_DURATION, BAZIS_DAMAGE_MULTIPLIER} = COLLISION_CONFIG;   
      
        bazis_element.animate({                                  // Bazis kick back
            "top" : bazis_rect.top + BAZIS_KICK_BACK_y_OFFSET
        }, ANIM_DURATION);

        bounty_container_damage( (base_level_entities.bazis.damage * BAZIS_DAMAGE_MULTIPLIER));       
                                                                       
        bazis_damage( base_level_entities.bounty.damage, bazis_data);
    }
}

function bazis_shots_container_collision_detection() {                         // Container VS Bazis shots
    
    const bounty_data = base_level_entities.bounty;
    if( !is_entity_valid(bounty_data)) {
        return;
    }
    const bounty_rect = bounty_data.rect;

    base_level_entities.bazis_shots.filter(bazis_shot_data => bazis_shot_data.is_active)
    .forEach( bazis_shot_data => {
        if( !is_entity_valid(bazis_shot_data)){
            return;
        }
        const bazis_shot_rect = bazis_shot_data.rect;

        if( check_collision( bounty_rect, bazis_shot_rect))
            {
            bounty_container_damage( bazis_shot_data.damage);    
            return_bazis_shot_to_pool( bazis_shot_data);             
        }
    });
}

function enemy_shots_container_collision_detection() {                         //  Container catch enemy shots
    
    const bounty_data = base_level_entities.bounty;
    if( !is_entity_valid(bounty_data)) {
        return;
    }
    const container_rect = base_level_entities.bounty.rect;

    base_level_entities.enemy_shots.filter( enemy_shot_data => enemy_shot_data.is_active)
    .forEach( enemy_shot_data => {
        if(!is_entity_valid(enemy_shot_data)){
            return;
        }
        const enemy_shot_rect = enemy_shot_data.rect;

        if( check_collision( container_rect, enemy_shot_rect))
            {
                return_enemy_shot_to_pool( enemy_shot_data);
            }
    });
}

function bazis_powerup_collision_detection() {                                    // PowerUp vs Bazis
    const bazis_data = base_level_entities.bazis;
    const powerup_data = base_level_entities.powerup;
    if (!is_entity_valid(bazis_data) || !is_entity_valid(powerup_data)) {
        return;
    }   

    const bazis_rect = bazis_data.rect;
    const powerup_rect = powerup_data.rect;
   
    if( check_collision( bazis_rect, powerup_rect)) 
        {                                                                    
            pick_up_powerup( powerup_data);                
        }   
}
