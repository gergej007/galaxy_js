function bazis_shots_boss_collision_detection()                                  // Bazis shot VS Boss
{  
    const boss_data = boss_level_entities.boss;
    if ( !is_entity_valid(boss_data)) {        
        return; 
    }
    const boss_rect = boss_data.rect;  

    base_level_entities.bazis_shots.filter(bazis_shot_data => bazis_shot_data.is_active)
    .forEach( bazis_shot_data => {
        if(!is_entity_valid(bazis_shot_data)){
            console.warn("Invalid bazis shot data in pool:", bazis_shot_data);
            return;
        }
        const bazis_shot_rect = bazis_shot_data.rect;

        if( check_collision( bazis_shot_rect, boss_rect))
        {           
            boss_damage( bazis_shot_data, boss_data, bazis_shot_data.damage );     
            return_bazis_shot_to_pool(bazis_shot_data);
        }
    }); 
}

function boss_shots_bazis_collision_detection() {                                // Boss shot VS Bazis
    const bazis_data = base_level_entities.bazis;
    if ( !is_entity_valid(bazis_data)) {        
        return; 
    }

    const bazis_rect = bazis_data.rect;
    boss_level_entities.boss_shots.filter( boss_shot_data => boss_shot_data.is_active)
    .forEach( boss_shot_data => {
        if(!is_entity_valid(boss_shot_data)){
            console.warn("Invalid boss shot data in pool:", boss_shot_data);
            return;
        }
        const boss_shot_rect = boss_shot_data.rect;
        const damage_ammount = boss_shot_data.damage;

        if( check_collision( bazis_rect, boss_shot_rect))
        {           
            return_boss_shot_to_pool( boss_shot_data);           
            bazis_damage(damage_ammount, bazis_data); 
        }
    });
}


function boss_bazis_collision_detection()                                              // Boss VS Bazis
{
    const bazis_data = base_level_entities.bazis;
    const boss_data = boss_level_entities.boss;
    if ( !is_entity_valid(boss_data) || !is_entity_valid(bazis_data)) {               
        return; 
    }

    const { EMP_STRIKE_ZONE_X_PX, EMP_STRIKE_ZONE_Y_PX, EMP_COOLDOWN_MS} = COLLISION_CONFIG;
    const boss_rect = boss_data.rect;   
    const bazis_rect = bazis_data.rect; 
    const damage_ammount = boss_data.damage;

    if(   bazis_rect.right > boss_rect.left - EMP_STRIKE_ZONE_X_PX
        && bazis_rect.left < boss_rect.right + EMP_STRIKE_ZONE_X_PX
        && bazis_rect.top < boss_rect.bottom + EMP_STRIKE_ZONE_Y_PX
        && bazis_rect.bottom > boss_rect.top)
        {      
            const now = Date.now();
            if(!weapons.emp_timeout || now - weapons.emp_timeout > EMP_COOLDOWN_MS) {
                weapons.emp_timeout = now;
                boss_emp_shake(boss_data, bazis_data); 
                bazis_damage( damage_ammount, bazis_data );   
            }          
    }    
}


function boss_shot_bazis_shot_collision_detection()                                // Boss shot VS  Bazis shot
{                                                                   
    base_level_entities.bazis_shots.filter(bazis_shot_data => bazis_shot_data.is_active)
    .forEach( bazis_shot_data => {

        if( !is_entity_valid(bazis_shot_data)){
            console.warn("Invalid bazis shot data in pool:", bazis_shot_data);
            return; 
        }
        const bazis_shot_rect = bazis_shot_data.rect;
            
        boss_level_entities.boss_shots.filter(boss_shot_data => boss_shot_data.is_active)
        .forEach( boss_shot_data => {

            if( !is_entity_valid(boss_shot_data)){
                console.warn("Invalid boss shot data in pool:", boss_shot_data);
                return;
            }
            const boss_shot_rect = boss_shot_data.rect;

            if( check_collision( bazis_shot_rect, boss_shot_rect))
            {
                shots_explosion_lightning(bazis_shot_rect.left, bazis_shot_rect.top);
                return_bazis_shot_to_pool( bazis_shot_data );
                return_boss_shot_to_pool( boss_shot_data);
            }
        });
    }); 
}
