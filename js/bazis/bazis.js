
function create_bazis() 
{
    const bazis_frame = $("<div class='bazis'>");
    base_level_entities.bazis.element = bazis_frame;
    bazis_frame.appendTo($("body"))
    .css({
        "left": $(window).width() / 2 - (bazis_frame.width() /2)
    }); 

    unified_image_loader( "bazis.png", (bazis_img)=> {
        bazis_img.addClass("bazis_img")
        .appendTo( bazis_frame)
        .show();
        
       base_level_entities.bazis.img_element = bazis_img;
    });   
        
    // bazis_key_binding(bazis_frame);
}

function bazis_key_binding(){
    
    $(document).on("keydown",
        function (e) {

            const bazis_data = base_level_entities.bazis;
            if( !bazis_data.element || bazis_data.rect.top === 0 || bazis_data.rect.left === 0) {
                console.log("Input ignored: Bazis is not ready yet.");
                return;
            } 
            const bazis_element = bazis_data.element;
            const ypoz = bazis_data.rect.top;
            const xpoz = bazis_data.rect.left;

            if ( e.keyCode == 38 ) {                                      //  moves up   
                e.preventDefault();   
                if( !game_data.game_states.exit_flag && !game_data.game_states.dialog_flag )
                {                              
                    if ( ypoz > 0 )
                    bazis_element.css({ "top": ypoz - 23 });
                }
            }

            if ( e.keyCode == 40 ) {                                    //  moves down
                e.preventDefault(); 
                if( !game_data.game_states.exit_flag && !game_data.game_states.dialog_flag )
                {                                                        
                if ( ypoz < $(window).height() - bazis_element.height())
                    bazis_element.css({ "top": ypoz + 23 });
                }
            }

            if ( e.keyCode == 39 ) {                                    //  moves right
                e.preventDefault();     
                if( !game_data.game_states.exit_flag && !game_data.game_states.dialog_flag )
                {                                                       
                    if (xpoz < $(window).width() - bazis_element.width())
                    bazis_element.css({ "left": xpoz + 23 });
                }
            }

            if ( e.keyCode == 37 ) {                                   //  moves left
                e.preventDefault();     
                if( !game_data.game_states.exit_flag && !game_data.game_states.dialog_flag )
                {                                                       
                    if ( xpoz > 0 )                           
                        bazis_element.css({ "left": xpoz - 23 });                  
                }
            }

            if ( e.keyCode == 18 )  {      
                e.preventDefault();                                      //  A-bomb
                if( !game_data.game_states.exit_flag && !game_data.game_states.dialog_flag )
                {      
                    if ( game_data.counters.a_bomb > 0 && !weapons.flags.a_bomb) {
                        a_bomb_launch();
                        audio_play("#egyeb1")
                    }
                }
            }

            if ( e.keyCode == 32 ) {                                   //  Bazis shot
                if( weapons.flags.single_lazer )
                    { max_shots_ammount = 8; }                         
                    if( !game_data.game_states.exit_flag && !game_data.game_states.dialog_flag )                 
                       {                   
                        bazis_primary_shot_type_controller();  

                        main_title_track();          
                      }           
            }
    });
}

/**
 * Validates the presence and readiness of the Bazis game entity.
 * This function checks for the existence of the Bazis data object, its associated
 * DOM element, and ensures that the element is both present in the DOM and has
 * been rendered with non-zero position coordinates.
 *
 * @returns {object|null} The `base_level_entities.bazis` data object if it is
 *                        valid and fully ready (element present and positioned),
 *                        otherwise `null`.
 */
function validate_bazis_presence(){
    const bazis_data = base_level_entities.bazis;
    if( !bazis_data || !bazis_data.element || bazis_data.element.length === 0 || ! bazis_data.rect
        || (bazis_data.rect.top === 0 && bazis_data.rect.left === 0))
    {
        console.log("Invalid Bazis data!");
        return null;
    }
    return bazis_data;
}