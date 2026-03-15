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
                return_bazis_shot_to_pool( bazis_shot_data );
                
                enemy_damage( enemy_data, bazis_shot_data.damage);                                                      
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
