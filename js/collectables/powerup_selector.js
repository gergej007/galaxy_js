function select_actual_powerup() {                                                 
   
    let powerup_img_src;
    let powerup_img_id;
    switch(base_level_entities.powerup.level)
    {
        case 1 : powerup_img_src = 'bounties/a_bomb1.png'; powerup_img_id = 'a_bomb';//actual_powerup_img  = $("<img src='kepek/bounties/a_bomb1.png' id='a_bomb'>");
                break;
        case 2 : powerup_img_src = 'bounties/dual_fire1.png'; powerup_img_id = 'dual_fire';//actual_powerup_img  = $("<img src='kepek/bounties/dual_fire1.png' id='dual_fire'>");     
                break;
        case 3 : powerup_img_src = 'bounties/h_missiles1.png'; powerup_img_id = 'h_missiles';//actual_powerup_img  = $("<img src='kepek/bounties/h_missiles1.png' id='h_missiles'>");     
                break; 
        case 4 : powerup_img_src = 'bounties/lazer1.png'; powerup_img_id =  'lazer';//actual_powerup_img  = $("<img src='kepek/bounties/lazer1.png' id='lazer'>");     
                break;     
        case 5 : powerup_img_src = 'bounties/tracking_lazer1.png'; powerup_img_id = 'tracking_lazer';//actual_powerup_img  = $("<img src='kepek/bounties/tracking_lazer1.png' id='tracking_lazer'>");     
                break;  
        case 6 : powerup_img_src = 'bounties/twin_lazer1.png'; powerup_img_id = 'twin_lazer';//actual_powerup_img  = $("<img src='kepek/bounties/twin_lazer1.png' id='twin_lazer'>");     
                break;   
        case 7 : powerup_img_src = 'bounties/shield1.png'; powerup_img_id = 'shield';//actual_powerup_img  = $("<img src='kepek/bounties/shield1.png' id='shield'>");     
                break;         
        default : powerup_img_src = 'bounties/a_bomb1.png'; powerup_img_id = 'a_bomb';//actual_powerup_img  = $("<img src='kepek/bounties/a_bomb1.png' id='a_bomb'>");     
                break;                                  
    }
    return { powerup_img_src : powerup_img_src, powerup_img_id : powerup_img_id };   
}

function pick_up_powerup(powerup)
{    
    audio_play("#bounty1");        
    
    switch(powerup.attr("id"))
    {
        case "a_bomb" : game_data.counters.a_bomb++;
                        score_dependent_fns();
                        update_center_display("A-BOMB COLLECTED !");                        
                        break;

        case "dual_fire" : weapons.flags.standard_shot = false;
                           weapons.flags.dual_fire_shot = true;
                           update_center_display("DUAL-FIRE MODE ACTIVE !");                       
                           break;

        case "h_missiles" : weapons.flags.homing_missile = true; 
                            schedule_next_missile_launch_attempt();  
                            update_center_display("HOMING-MISSILES MOUNTED !");                           
                            break;

        case "lazer" : weapons.flags.dual_fire_shot = false;
                       weapons.flags.single_lazer = true;  
                       update_center_display("LAZER EQUIPPED !");               
                       break;  
                       
        case "tracking_lazer" : weapons.flags.homing_missile = false;
                                clearTimeout(homing_missile_timeout); 
                                weapons.flags.tracking_lazer = true;
                                tracking_lazer_scheduler(); 
                                update_center_display("TRACKING-LAZER EQUIPPED !");                             
                                break; 

        case "twin_lazer" : weapons.flags.single_lazer = false;
                            weapons.flags.dual_lazer = true; 
                            update_center_display("TWIN-LAZER MOUNTED !");                          
                            break; 

        case "shield" : bazis_invulnerability = true;  
                        update_center_display("SHIELD FOR 60 SEC !");        
                        god_mode();                                         
                        break; 

        default : game_data.counters.a_bomb++;
                  score_dependent_fns();                  
                  update_center_display("A-BOMB COLLECTED !");                   
                  break;             
    }
    
    powerup.remove();    
    base_level_entities.powerup.element = null;
    base_level_entities.powerup.rect = null;

    game_data.game_states.bounty_flag = false; 
    clearTimeout(powerup_animation_duration);
}