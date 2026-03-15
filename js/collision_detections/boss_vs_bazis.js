function bazis_shots_boss_collision_detection()                                  // Bazis shot VS Boss
{  
    const boss_data = boss_level_entities.boss;
    if ( !boss_data || !boss_data.rect) {        
        return; 
    }
    const boss_rect = boss_data.rect;  

    base_level_entities.bazis_shots.filter(bazis_shot_data => bazis_shot_data.is_active)
    .forEach( bazis_shot_data => {
        const bazis_shot_rect = bazis_shot_data.rect;

        if ( !bazis_shot_rect ) { return; }     

        if( check_collision( bazis_shot_rect, boss_rect))
        {           
            boss_damage( bazis_shot_data, boss_data, bazis_shot_data.damage );     
            return_bazis_shot_to_pool(bazis_shot_data);
        }
    }); 
}

function boss_shots_bazis_collision_detection() {                                // Boss shot VS Bazis
    const bazis_data = base_level_entities.bazis;
    if ( !bazis_data || !bazis_data.rect) {        
        return; 
    }

    const bazis_rect = bazis_data.rect;
    boss_level_entities.boss_shots.filter( boss_shot_data => boss_shot_data.is_active)
    .forEach( boss_shot_data => {
        const boss_shot_rect = boss_shot_data.rect;
        const boss_shot_element = boss_shot_data.element;
        const damage_ammount = boss_shot_data.damage;

        if( !boss_shot_rect || !boss_shot_element){
            return;
        }

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
    if ( !boss_data || !boss_data.rect 
        || !bazis_data || !bazis_data.rect ) {        
        return; 
    }
    const boss_rect = boss_data.rect;   
    const bazis_rect = bazis_data.rect; 
    const damage_ammount = boss_data.damage;

    const horizontal_damage_zone = 70;
    const vertical_damage_zone = 100;

    if(   bazis_rect.right > boss_rect.left - horizontal_damage_zone
        && bazis_rect.left < boss_rect.right + horizontal_damage_zone
        && bazis_rect.top < boss_rect.bottom + vertical_damage_zone
        && bazis_rect.bottom > boss_rect.top)
        {         
           boss_emp_shake(boss_data, bazis_data); 
       
           bazis_damage( damage_ammount, bazis_data );   
    }    
}


function boss_shot_bazis_shot_collision_detection()                                // Boss shot VS  Bazis shot
{                                                                   
    base_level_entities.bazis_shots.filter(bazis_shot_data => bazis_shot_data.is_active)
    .forEach( bazis_shot_data => {

        if( !bazis_shot_data.rect ){ return; }

        const bazis_shot_rect = bazis_shot_data.rect;
            
        boss_level_entities.boss_shots.filter(boss_shot_data => boss_shot_data.is_active)
        .forEach( boss_shot_data => {

            if( !boss_shot_data.rect || !boss_shot_data.element){
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
