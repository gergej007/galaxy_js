const boss_level_entities = {
    asteroid : { element: null, img_element: null, current_image_src: '', rect: null,
                direction: null, damage :10, type :'Asteroid' },
    boss : { element: null, img_element: null, rect: null, hp: 1000, damage: 20 , 
            direction: null, attack_timeout_ids: [] },   
    boss_shots : boss_shot_pool 
}

const base_level_entities = {
    bazis : { element: null, rect: null, img_element: null, lives: 3, hp: 99, max_hp: 99, damage: 25 },
    bounty : { element: null, rect: null, type: "Bounty", direction: null, hp: 100, max_hp: 100, damage: 5 },
    powerup : { element: null, rect: null, level: 0, type: null,  duration: 6000 },
    enemy_ships : enemy_pool,
    bazis_shots : bazis_shot_pool,
    homing_missiles : homing_missile_pool,
    tracking_lazers : tracking_lazer_pool,
    enemy_shots : enemy_shot_pool
}

const game_data = {
    counters : { enemies: 0, killed: 0, score: 0, a_bomb: 3},    
    game_states : { traffic_flag: true, boss_flag: false, exit_flag: false, dialog_flag: true, bounty_flag: false},
    limits : { boss_limit: GAME_CONSTANTS.BOSS_LIMIT, 
               bounty_limit: GAME_CONSTANTS.INITIAL_BOUNTY_LIMIT, 
               act_limit: GAME_CONSTANTS.INITIAL_LEVEL_UP_SCORE },
    levels : { act_level: 1 }
} 

const weapons = {
    flags: { standard_shot: true, dual_fire_shot: false, single_lazer: false, dual_lazer: false,
             homing_missile: false, tracking_lazer: false, god_mode: false, a_bomb: false
     }
}

    function update_boss_entity_rects() {                            //Dynamic Element Discovery
    // Update Boss's rect                                           
    if( boss_level_entities.boss.element) {  
        boss_level_entities.boss.rect = boss_level_entities.boss.element[0].getBoundingClientRect();
    }

    // Update asteroids' rect
    if( boss_level_entities.asteroid.element){
        boss_level_entities.asteroid.rect = boss_level_entities.asteroid.element[0].getBoundingClientRect();
    }

    // Update Boss shots' rects
    boss_level_entities.boss_shots.forEach(boss_shot_data => {
        if (boss_shot_data.is_active) {
            if (boss_shot_data.element && boss_shot_data.element.length > 0 && $.contains(document.body, boss_shot_data.element[0])) {
                boss_shot_data.rect = boss_shot_data.element[0].getBoundingClientRect();
            } else {
                boss_shot_data.rect = null;      
                boss_shot_data.is_active = false;
                }
            }
            else boss_shot_data.rect = null; 
        });  
}

function update_base_entity_rects(){
      // Update bazis' rect
    const bazis = base_level_entities.bazis;         
       if( bazis.element) {
           bazis.rect = base_level_entities.bazis.element[0].getBoundingClientRect();
       } else {
        bazis.rect = null;
       }
    
      // Update bazis shots' rects    
    base_level_entities.bazis_shots.forEach(shot_data => {
        if (shot_data.is_active) {         
            if (shot_data.element && shot_data.element.length > 0 && $.contains(document.body, shot_data.element[0])) {
            shot_data.rect = shot_data.element[0].getBoundingClientRect();
        } else {
            shot_data.rect = null;      // Clear rect for inactive shots
            shot_data.is_active = false;
            }
        }
        else shot_data.rect = null; 
    });

    // Update homing missiles' rects
    base_level_entities.homing_missiles.forEach( missile_data => {
        if(missile_data.is_active){
            if (missile_data.element && missile_data.element.length > 0 && $.contains(document.body, missile_data.element[0])) {
                missile_data.rect = missile_data.element[0].getBoundingClientRect();
            }
            else {
                missile_data.is_active = false;
                missile_data.rect = null;
            }
        }
        else{
            missile_data.rect = null; 
        }
    });

     // Update enemy ships' rect
    base_level_entities.enemy_ships.forEach(enemy_data => {
        if (enemy_data.is_active) { 
            if (enemy_data.element && enemy_data.element.length > 0 && $.contains(document.body, enemy_data.element[0])) {
                enemy_data.rect = enemy_data.element[0].getBoundingClientRect();
            } else {               
                enemy_data.is_active = false;
                enemy_data.rect = null;                           
            }
        } else enemy_data.rect = null;         
    });
   
        // Update enemy shot's rect
      base_level_entities.enemy_shots.forEach(enemy_shot_data => {
        if (enemy_shot_data.is_active) {
            if (enemy_shot_data.element && enemy_shot_data.element.length > 0 && $.contains(document.body, enemy_shot_data.element[0])) {
                enemy_shot_data.rect = enemy_shot_data.element[0].getBoundingClientRect();
            } else {
                enemy_shot_data.rect = null;      
                enemy_shot_data.is_active = false;
                }
            }
            else enemy_shot_data.rect = null; 
        });       

      // Update bounty container's rect
      const bounty = base_level_entities.bounty;                           // eztmajd még
    if (bounty.element &&  bounty.element.length > 0 && $.contains(document.body, bounty.element[0])) {   
        bounty.rect = bounty.element[0].getBoundingClientRect();
    } else {
        bounty.rect = null;
    }
   
      // Update powerup's rect
      const powerup = base_level_entities.powerup;
      if (powerup.element && powerup.element.length > 0 && $.contains(document.body, powerup.element[0])) {
          powerup.rect = powerup.element[0].getBoundingClientRect();
      } else {
          powerup.rect = null; 
      }
}
