/**
 * Selects the appropriate power-up data based on the current power-up level.
 * @returns {Object} The image source and type for the selected power-up.
 */
function select_actual_powerup() {                                                 
        const level = base_level_entities.powerup.level;
        
        const data = POWERUP_REGISTRY[level] || POWERUP_REGISTRY[1];
                                                                   
        return { 
            powerup_img_src: data.src, 
            type: data.type 
        };   
    }

/**
 * Processes the effects of collecting a power-up and cleans up the entity.
 * Uses a data-driven action map for better scalability.
 * @param {Object} powerup_data - The power-up data object from base_level_entities.
 */
    function pick_up_powerup(powerup_data) {    
        audio_play(POWERUP_SPAWN_CONFIG.AUDIO_KEY);        
        
        const powerup_actions = {
            a_bomb() {
                game_data.counters.a_bomb++;
                score_dependent_fns();
                update_center_display("A-BOMB COLLECTED !");
            },
            dual_fire() {
                weapons.flags.standard_shot = false;
                weapons.flags.dual_fire_shot = true;
                update_center_display("DUAL-FIRE MODE ACTIVE !");
            },
            h_missiles() {
                weapons.flags.homing_missile = true; 
                schedule_next_missile_launch_attempt();  
                update_center_display("HOMING-MISSILES MOUNTED !");
            },
            lazer() {
                weapons.flags.dual_fire_shot = false;
                weapons.flags.single_lazer = true;  
                update_center_display("LAZER EQUIPPED !");
            },
            tracking_lazer() {
                weapons.flags.homing_missile = false;
                clearTimeout(homing_missile_timeout); 
                weapons.flags.tracking_lazer = true;
                tracking_lazer_scheduler(); 
                update_center_display("TRACKING-LAZER EQUIPPED !");
            },
            twin_lazer(){
                weapons.flags.single_lazer = false;
                weapons.flags.dual_fire_shot = false;
                weapons.flags.dual_lazer = true; 
                update_center_display("TWIN-LAZER MOUNTED !");
            },
            shield() {
                bazis_invulnerability = true;  
                update_center_display(`SHIELD FOR ${POWERUP_SPAWN_CONFIG.PRESENCE_DURATION} SEC !`/*"SHIELD FOR 60 SEC !"*/);        
                god_mode();
            }
        };
    
        const action = powerup_actions[powerup_data.type];
    
    if (action) {
        action();
    } else {
        powerup_actions.a_bomb();
    }        
        reset_powerup_data(powerup_data);             
    }    