let lazer_shot_counter = 0; 
// const MAX_TRACKED_ENEMIES_PER_BURST = 6; 
let tracking_lazer_timeout = null; 
// const TRACKING_LAZER_INTERVAL = 2500;  
/**
 * Main function for the Tracking Lazer weapon.
 * It checks if the weapon is active and then triggers the core tracking and killing logic.
 * It also manages the recursive call for the next tracking cycle.
 *
 * @returns {void}
 */                                            
function tracking_lazer_scheduler() {    
    if (tracking_lazer_timeout) {
        clearTimeout(tracking_lazer_timeout);
    }

    if (weapons.flags.tracking_lazer) {       
        tracking_lazer_core_logic(); 
    }
    
    tracking_lazer_timeout = setTimeout(() => {
        if (weapons.flags.tracking_lazer) {
            tracking_lazer_scheduler(); 
        } else {
            tracking_lazer_timeout = null; 
            console.log("Tracking Lazer deactivated.");
        }
    }, SECONDARY_WEAPONS_CONFIG.TRACKING_LAZER.TRACKING_LAZER_INTERVAL); 
}

/**
 * Core asynchronous logic for tracking enemies and firing lazers.
 * It iterates through enemies, identifies valid targets within a simplified field,
 * and animates a lazer shot to them, triggering an explosion.
 * Targets are not 'locked' by this system.
 *
 * @returns {Promise<void>} A promise that resolves when the current lazer burst attempt is complete.
 */
async function tracking_lazer_core_logic() {
    lazer_shot_counter = 0; 

    const { MIN_ACTIVE_ENEMIES, MAX_TRACKED_ENEMIES_PER_BURST, AUDIO_KEY,        
            ANIMATION_DURATION, ANIMATION_EASING, MS_BETWEEN_SHOTS
        } = SECONDARY_WEAPONS_CONFIG.TRACKING_LAZER;

    const bazis_data = base_level_entities.bazis;
    const bazis_element = $(bazis_data.element); 
    const bazis_rect = bazis_data.rect;
    if ( !bazis_data || !bazis_rect || bazis_element.length === 0) {
        console.log("Bazis not found in DOM for tracking lazer.");
        return; 
    }
    
    const active_enemy_data_objects  = base_level_entities.enemy_ships.filter(enemy_data => {
        return enemy_data.is_active && enemy_data.element && enemy_data.rect;
    });

    if( active_enemy_data_objects.length < MIN_ACTIVE_ENEMIES ){
        return;
    }
    const search_conditions = define_target_field_bounds( bazis_rect );

    for (let i = 0; i < active_enemy_data_objects.length; i++) {
        
        if ( lazer_shot_counter >= MAX_TRACKED_ENEMIES_PER_BURST || !weapons.flags.tracking_lazer) {
            console.log("Tracking lazer stopped during burst.");    
            break;
        }

        const enemy_data = active_enemy_data_objects[i];
        
        if (!enemy_data.element || !enemy_data.rect ) {
            continue; 
        }

        const enemy_rect = enemy_data.rect;
        const enemy_element = $(enemy_data.element); 
      
        if( evaluate_target_field_bounds( enemy_rect, search_conditions))
            {           
            
            const lazer_data = get_tracking_lazer_from_pool();
            if (!lazer_data) {
                // If pool exhausted, skip this lazer shot but continue trying for others
                continue;
            }
            const lazer_line = lazer_data.element;
            audio_play(AUDIO_KEY);  
            lazer_shot_counter++;   

            const line_properties = create_line_properties(enemy_element, bazis_element);
            lazer_line.css({
                "left": line_properties.left,
                "top": line_properties.top,
                "width": line_properties.width,
                "height": line_properties.height,
                "transform": line_properties.transform, 
                "opacity": 0, 
                "display": "block" 
            });
            lazer_line.appendTo($("body"));

            await new Promise(resolve => { // Await animation completion
                
                lazer_line.animate({
                    "opacity": 1  
                }, ANIMATION_DURATION, ANIMATION_EASING, 
                    function () {
                        
                        explode_spacekraft( enemy_data ); 
                        add_score_n_hit();
                        
                        return_tracking_lazer_to_pool(lazer_data);                        
                        resolve(); 
                    });
            });           
            await new Promise(resolve => setTimeout(resolve, MS_BETWEEN_SHOTS)); 
        }
    }
}

function define_target_field_bounds( bazis_rect){

    const { TOP_BOUND_FACTOR, BOTTOM_BOUND_FACTOR, RAW_HORIZONTAL_BOUND_FACTOR, TARGET_HORIZONTAL_BOUND_PX} 
    = SECONDARY_WEAPONS_CONFIG.TRACKING_LAZER;

    const target_bound_top = $(window).height() * TOP_BOUND_FACTOR; 
    const target_bound_bottom = $(window).height() * BOTTOM_BOUND_FACTOR;
    const bazis_mid = bazis_rect.left + bazis_rect.width / 2;
    const raw_left_bound = bazis_mid - $(window).width() * RAW_HORIZONTAL_BOUND_FACTOR;
    const raw_right_bound = bazis_mid + $(window).width() * RAW_HORIZONTAL_BOUND_FACTOR;
    const target_bound_left = Math.max( TARGET_HORIZONTAL_BOUND_PX, raw_left_bound);
    const target_bound_right = Math.min($(window).width() - TARGET_HORIZONTAL_BOUND_PX, raw_right_bound);

    return  { 
        left_bound: target_bound_left,
        right_bound: target_bound_right,
        bottom_bound: target_bound_bottom, 
        top_bound: target_bound_top 
    };
}

/**
* Evaluates if an enemy is within the defined bounds of the tracking lazer's targeting field.
 * This includes checking horizontal and vertical screen regions relative to the window size
 * and bazis position.
 *
 * @param {DOMRect} enemy_rect - The DOMRect object of the enemy element to evaluate.
 * @returns {boolean} True if the enemy is within all specified bounds and game is not exiting, false otherwise.
 */
function evaluate_target_field_bounds( enemy_rect, search_conditions ){

    if( enemy_rect.top >= search_conditions.top_bound &&
        enemy_rect.bottom <= search_conditions.bottom_bound &&
        enemy_rect.left >= search_conditions.left_bound &&
        enemy_rect.right <= search_conditions.right_bound &&
        !game_data.game_states.exit_flag ){ 
            return true;
        }
    return false;    
}

function create_line_properties(obj1, obj2) {

    const { LINE_THICKNESS_PX, DEGREES_PER_RADIAN} = SECONDARY_WEAPONS_CONFIG.TRACKING_LAZER;

    const off1 = get_element_property(obj1);
    const off2 = get_element_property(obj2);

    const dx1 = off1.left + off1.width / 2;
    const dy1 = off1.top + off1.height / 2;
    const dx2 = off2.left + off2.width / 2;
    const dy2 = off2.top + off1.height / 2;

    const length = Math.sqrt(((dx2 - dx1) * (dx2 - dx1)) + ((dy2 - dy1) * (dy2 - dy1)));
    const line_thickness = LINE_THICKNESS_PX;
    const cx = ((dx1 + dx2) / 2) - (length / 2);
    const cy = ((dy1 + dy2) / 2) - (line_thickness / 2);
    const angle = parseInt(Math.atan2((dy1 - dy2), (dx1 - dx2)) * (DEGREES_PER_RADIAN / Math.PI));

    return {
        left: cx,
        top: cy,
        width: length,
        height: line_thickness,
        transform: `rotate(${angle}deg)`
    };
}

function get_element_property(elem){
    const elem_rect = elem[0].getBoundingClientRect();	
    
    return { top: elem_rect.top, left: elem_rect.left, width: elem_rect.width, height: elem_rect.height };
};
