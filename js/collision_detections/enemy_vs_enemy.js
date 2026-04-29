function enemy_shots_enemy_collision_detection()                 // spatial hash ???
{
    base_level_entities.enemy_shots.filter( enemy_shot_data => enemy_shot_data.is_active)
    .forEach( enemy_shot_data => {
        if( !is_entity_valid(enemy_shot_data)){
            console.warn("Invalid enemy shot data in pool:", enemy_shot_data);
            return;
        }
        const enemy_shot_rect = enemy_shot_data.rect;

        const shooter_id = enemy_shot_data.shooter_id;

        base_level_entities.enemy_ships.filter(enemy_data => enemy_data.is_active)
        .forEach( enemy_data => {
            if(!is_entity_valid(enemy_data)){
                console.warn("Collision failed due to invalid enemy data!");
                return;
            }
            const enemy_rect = enemy_data.rect;
         
            const target_enemy_id = enemy_data.id;   
                                                           
            if (target_enemy_id === shooter_id) {                                       
                return; 
            }

            if( check_collision( enemy_shot_rect, enemy_rect)) {
                enemy_damage( enemy_data );
                return_enemy_shot_to_pool( enemy_shot_data);
            }
        });                                      
    });
}