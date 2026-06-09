<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="kepek/atomic.png">
    <link rel="stylesheet" type="text/css" href="jquery/jquery-ui-1.9.1.custom.css">
    <link rel="stylesheet" type="text/css" href="css/galaxy.css">
    <link rel="stylesheet" type="text/css" href="css/boss.css">
    <link rel="stylesheet" type="text/css" href="css/screen.css">
    <link rel="stylesheet" type="text/css" href="css/ui.css">
    <script type="text/javascript" src="jquery/jquery-1.8.2.js"></script>
    <script type="text/javascript" src="jquery/jquery-ui-1.9.1.custom.js"></script>
    
    <script type="text/javascript" src="js/config/galaxy_config.js"></script>
    <script type="text/javascript" src="js/config/ui_config.js"></script>
    <script type="text/javascript" src="js/config/game_config.js"></script>
    <script type="text/javascript" src="js/game/game_levels.js"></script>
    <script type="text/javascript" src="js/config/pool_config.js"></script>  
    <script type="text/javascript" src="js/object_pooling/create_pooled_elements.js"></script>  
    <script type="text/javascript" src="js/object_pooling/object_pooling.js"></script>  
    <script type="text/javascript" src="js/object_pooling/return_obj_to_pool.js"></script>  
    <script type="text/javascript" src="js/object_pooling/get_obj_from_pool.js"></script>  
    <script type="text/javascript" src="js/game/game_elements.js"></script>  
    <script type="text/javascript" src="js/unified_helpers.js"></script>  
    
    <script type="text/javascript" src="js/spatial_hash/spatial_hash.js"></script>  

    <script type="text/javascript" src="js/config/bs_weapons_config.js"></script>
    <script type="text/javascript" src="js/config/boss_config.js"></script>
    <script type="text/javascript" src="js/config/bazis_weapons_config.js"></script>

    <script type="text/javascript" src="js/config/bazis_config.js"></script>
    <script type="text/javascript" src="js/bazis/input_handlers.js"></script>
    <script type="text/javascript" src="js/bazis/key_actions.js"></script>
    <script type="text/javascript" src="js/bazis/bazis_main.js"></script>
    <script type="text/javascript" src="js/bazis/bazis_damage.js"></script>
    <script type="text/javascript" src="js/config/collision_config.js"></script>
    <script type="text/javascript" src="js/collision_detections/collision_util.js"></script>
    <script type="text/javascript" src="js/collision_detections/bazis_vs_enemy.js"></script>
    <script type="text/javascript" src="js/config/enemy_config.js"></script>
    <script type="text/javascript" src="js/enemy/enemy_helpers.js"></script>
    <script type="text/javascript" src="js/enemy/enemy_spawn_manager.js"></script>
    <script type="text/javascript" src="js/enemy/enemy_spawn_logic.js"></script>
    <script type="text/javascript" src="js/enemy/enemy_shot.js"></script>
    <script type="text/javascript" src="js/enemy/enemy_damage.js"></script>
    <script type="text/javascript" src="js/enemy/enemy_explosions.js"></script>
    <script type="text/javascript" src="js/collision_detections/enemy_vs_enemy.js"></script>
    <script type="text/javascript" src="js/game/init_game.js"></script>
    <script type="text/javascript" src="js/galaxy.js"></script>
    <script type="text/javascript" src="js/audio.js"></script>
    <script type="text/javascript" src="js/ui/displays.js"></script>
    <script type="text/javascript" src="js/ui/start_panel.js"></script>
    <script type="text/javascript" src="js/ui/score_panel.js"></script>
    <script type="text/javascript" src="js/ui/screen.js"></script>
    <!-- <script type="text/javascript" src="js/config/boss_config.js"></script>   -->
    <!-- <script type="text/javascript" src="js/config/bs_weapons_config.js"></script>   -->
    <script type="text/javascript" src="js/boss/boss_weapons/bs_cone_shots.js"></script>  
    <script type="text/javascript" src="js/boss/boss_weapons/bs_homing_shots.js"></script>  
    <script type="text/javascript" src="js/boss/boss_weapons/bs_lazer_shots.js"></script>  
    <script type="text/javascript" src="js/boss/boss_weapons/bs_emp_shake.js"></script>  
    <script type="text/javascript" src="js/boss/boss_weapons/bs_shot_scheduler.js"></script>  
    <script type="text/javascript" src="js/boss/boss_damage.js"></script>  
    <script type="text/javascript" src="js/boss/boss_death.js"></script>  
    <script type="text/javascript" src="js/boss/boss_explosions.js"></script>  
    <script type="text/javascript" src="js/boss/boss_level_animations.js"></script>  
    <script type="text/javascript" src="js/boss/boss_main.js"></script>
    <script type="text/javascript" src="js/boss/boss_movements.js"></script>
    <script type="text/javascript" src="js/collision_detections/boss_vs_bazis.js"></script>
    <script type="text/javascript" src="js/weapons/a_bomb.js"></script>
    <script type="text/javascript" src="js/weapons/single_shot.js"></script>
    <script type="text/javascript" src="js/weapons/dual_shot.js"></script>
    <script type="text/javascript" src="js/weapons/single_lazer_shot.js"></script>
    <script type="text/javascript" src="js/weapons/dual_lazer_shot.js"></script>
    <script type="text/javascript" src="js/weapons/bazis_shot_controller.js"></script>    
    <script type="text/javascript" src="js/weapons/tracking_lazer.js"></script>    
    <script type="text/javascript" src="js/weapons/god_mode.js"></script>    
    <script type="text/javascript" src="js/weapons/homing_missiles/homing_missile_targeting.js"></script>
    <script type="text/javascript" src="js/weapons/homing_missiles/homing_missile_impact.js"></script>
    <script type="text/javascript" src="js/weapons/homing_missiles/homing_missiles_main.js"></script>
    <script type="text/javascript" src="js/config/bounty_config.js"></script>
    <script type="text/javascript" src="js/collectables/bounty_util.js"></script>
    <script type="text/javascript" src="js/collectables/bounty_main.js"></script>
    <script type="text/javascript" src="js/collectables/bounty_damage.js"></script>
    <script type="text/javascript" src="js/collectables/hp_indicator.js"></script>
    <script type="text/javascript" src="js/collectables/spawn_powerup.js"></script>
    <script type="text/javascript" src="js/collectables/powerup_selector.js"></script>
    <script type="text/javascript" src="js/collision_detections/bounty_vs_all.js"></script>
    <script type="text/javascript" src="js/config/asteroid_config.js"></script>
    <script type="text/javascript" src="js/asteroids/asteroids.js"></script>
    <script type="text/javascript" src="js/collision_detections/asteroid_vs_all.js"></script>
    <title>Galaxy js</title>
</head>
<?php
    include ("modulok/audio_files.php");
?>
<body>
    <div class="upper_display_lane">
        <div class="player_display"></div>
        <div id="progress_frame"></div>
        <div class="result_display"></div>
    </div> 

</body>

</html>