function primary_game_loop(){  
    if(game_data.game_states.traffic_flag){
        update_base_entity_rects();
        bazis_enemy_shots_collision_detection();
        bazis_enemy_collision_detection();
        bazis_shot_enemy_shot_collision_detection();
        bazis_shots_enemy_collision_detection();
        if(game_data.levels.act_level < 3)
            {
            enemy_shots_enemy_collision_detection();
        }
    }   

    if(game_data.game_states.bounty_flag){
        bazis_container_collision();
        enemy_shots_container_collision_detection();
        bazis_shots_container_collision_detection();
        bazis_powerup_collision_detection();
    }

    if(game_data.game_states.boss_flag){
        bazis_shots_boss_collision_detection();
        boss_shots_bazis_collision_detection();
        boss_bazis_collision_detection();
        boss_shot_bazis_shot_collision_detection();

        asteroid_bazis_collision_detection();
        asteroid_bazis_shots_collision_detection();
        asteroid_boss_shots_collision_detection();

        update_boss_entity_rects();        
        update_base_entity_rects();   
    }
             
    window.requestAnimationFrame(primary_game_loop);
   
}
