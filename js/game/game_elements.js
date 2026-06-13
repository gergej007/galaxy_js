const boss_level_entities = {
    asteroid : { element: null, img_element: null, current_image_src: '', rect: null,
                direction: null, damage :5, type :GAME_ENTITY_TYPES.ASTEROID },
    boss : { element: null, img_element: null, rect: null, hp: 1000, damage: 20,  
             direction: null, attack_timeout_ids: [], type: GAME_ENTITY_TYPES.BOSS },   
    boss_shots : pool_state.pools.boss_shot_pool 
}

const base_level_entities = {
    bazis : { element: null, rect: null, img_element: null, lives: 3, hp: 99, max_hp: 99, damage: 25, 
              is_exploding: false, is_colliding: false, type: GAME_ENTITY_TYPES.BAZIS},
    bounty : { element: null, rect: null, type: GAME_ENTITY_TYPES.BOUNTY, direction: null, hp: 100, max_hp: 100, damage: 5 },
    hp_indicator: { element: null, fill: null},
    powerup : { element: null, rect: null, level: 0, type: null, timer: null, type: null },
    enemy_ships : pool_state.pools.enemy_pool,
    bazis_shots : pool_state.pools.bazis_shot_pool,
    homing_missiles : pool_state.pools.homing_missile_pool,
    tracking_lazers : pool_state.pools.tracking_lazer_pool,
    enemy_shots : pool_state.pools.enemy_shot_pool
}

const displays = {
    left_display: { element: null, selector: UI_CONFIG.HUD.LEFT.SELECTOR},
    right_display: { element:null, selector: UI_CONFIG.HUD.RIGHT.SELECTOR},
    center_display: { element: null, selector: UI_CONFIG.HUD.CENTER.PROGRESS_BAR.SELECTOR, is_animating: false },
    progress_bar: { instance: null, max_hp: boss_level_entities.boss.hp }
}

const dialogs = {
    start_panel: { element: null, template_url: UI_CONFIG.DIALOGS.START.TEMPLATE},
    score_panel: { element: null, is_open: false, template_url: UI_CONFIG.DIALOGS.SCORE.TEMPLATE}
};

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
             homing_missile: false, tracking_lazer: false, god_mode: false, a_bomb: false, emp_timeout: 0
     }
}

    function update_boss_entity_rects() {                            //Dynamic Element Discovery
    //  Update Boss's rect    
    boss_level_entities.boss.rect = boss_level_entities.boss.element[0].getBoundingClientRect();
   
    //  Update asteroids' rect
    if( boss_level_entities.asteroid.element){
        boss_level_entities.asteroid.rect = boss_level_entities.asteroid.element[0].getBoundingClientRect();
    }

    //  Update Boss shots' rects
    boss_level_entities.boss_shots.forEach(boss_shot_data => {
        if (boss_shot_data.is_active) {
            if (boss_shot_data.element && boss_shot_data.element.length > 0 && $.contains(document.body, boss_shot_data.element[0])) {
                boss_shot_data.rect = boss_shot_data.element[0].getBoundingClientRect();
            } 
        }          
    });  
    }

function update_base_entity_rects(){
      //   Update bazis' rect
    const bazis = base_level_entities.bazis;         
       if( bazis.element) {
           bazis.rect = base_level_entities.bazis.element[0].getBoundingClientRect();
       } 
    
      //  Update bazis shots' rects    
    base_level_entities.bazis_shots.forEach(shot_data => {
        if (shot_data.is_active) {         
            if (shot_data.element && shot_data.element.length > 0 && $.contains(document.body, shot_data.element[0])) {
            shot_data.rect = shot_data.element[0].getBoundingClientRect();
        }
    }        
    });

    //  Update homing missiles' rects
    base_level_entities.homing_missiles.forEach( missile_data => {
        if(missile_data.is_active){
            if (missile_data.element && missile_data.element.length > 0 && $.contains(document.body, missile_data.element[0])) {
                missile_data.rect = missile_data.element[0].getBoundingClientRect();
            }        
        }
    });

     //  Update enemy ships' rect
    base_level_entities.enemy_ships.forEach(enemy_data => {
        if (enemy_data.is_active) { 
            if (enemy_data.element && enemy_data.element.length > 0 && $.contains(document.body, enemy_data.element[0])) {
                enemy_data.rect = enemy_data.element[0].getBoundingClientRect();
            }                        
        }              
    });
   
        //  Update enemy shot's rect
      base_level_entities.enemy_shots.forEach(enemy_shot_data => {
        if (enemy_shot_data.is_active) {
            if (enemy_shot_data.element && enemy_shot_data.element.length > 0 && $.contains(document.body, enemy_shot_data.element[0])) {
                enemy_shot_data.rect = enemy_shot_data.element[0].getBoundingClientRect();
            } 
        }         
        });       

      //  Update bounty container's rect
      const bounty = base_level_entities.bounty;                           
    if (bounty.element &&  bounty.element.length > 0 && $.contains(document.body, bounty.element[0])) {   
        bounty.rect = bounty.element[0].getBoundingClientRect();
    } 
   
      //  Update powerup's rect
      const powerup = base_level_entities.powerup;
      if (powerup.element && powerup.element.length > 0 && $.contains(document.body, powerup.element[0])) {
          powerup.rect = powerup.element[0].getBoundingClientRect();
      }
}
