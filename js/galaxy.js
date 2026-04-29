let resize_timer;

$(window).on('resize', function() {
    clearTimeout(resize_timer);
    resize_timer = setTimeout(function() {
        create_background();

        const $active_dialog = $(".ui-dialog-content:visible");
        if ($active_dialog.length > 0) {
            // jQuery UI way to re-center
            $active_dialog.dialog("option", "position", { 
                my: "center", 
                at: "center", 
                of: window 
            });
        }
    }, 250); 
});

$(document).on("keydown", function(e) {
    if (e.key === "F5") {                           // F5 key
        e.preventDefault(); 
        
        console.log("F5 pressed: Performing hard reset (bypassing cache if possible).");
        
        const url = new URL(window.location.href);
        url.searchParams.set('cache-buster', Date.now()); 
        window.location.href = url.toString();        
    }
});


primary_game_loop();

$(document).ready(
    function () {                         
        kezdo_panel(game_data.counters.score);
        create_background();      
        create_bazis();        
        update_base_entity_rects();  
        bazis_key_binding();
        
        game_level_change(1);  
        initialize_all_pools(game_data.levels.act_level);                    
                                           
        update_right_display();
        score_dependent_fns();  
    }
);

function bazis_reset() {
    game_data.game_states.exit_flag = true; 
    const bazis_data = base_level_entities.bazis;  
    const bazis_element = bazis_data.element;

    bazis_element.stop(true, true)
    .css({
        "top": "",
        "left": ""
    });

    bazis_element.css("visibility", "hidden");
    bazis_element.css({
        "left": $(window).width() / 2 - 32,
        "top": $(window).height() - bazis_element.height()
    });
  
    setTimeout(function () { 
        
        bazis_element.css("visibility", "visible");
        bazis_data.is_exploding = false;
        game_data.game_states.exit_flag = false;
     }, 1000);
    audio_play("#impact3");
}


/**
 * A robust utility to load an image and execute a callback once ready.
 * Handles both network loads and browser cache hits.
 * 
 * @param {string} relative_src - The path relative to the 'kepek/' folder.
 * @param {function} on_ready -  Callback function(jQueryObject).
 */
function unified_image_loader(relative_src, on_ready) {
    const full_src = "kepek/"+relative_src;
    const $img = $("<img />").attr("src", full_src).hide();

    const handle_ready = () => {
        if ($img.data('img-ready')) return;
        $img.data('img-ready', true);
        
        // Pass the ready image back to the caller
        if (typeof on_ready === 'function') {
            on_ready($img);
        }
    };

    // 1. Attach the load listener
    $img.on("load", handle_ready);

    // 2. Immediate cache check
    if ($img[0].complete && $img[0].naturalWidth !== 0) {
        handle_ready();
    }

    // 3. Error handling
    $img.on("error", () => {
        console.error(`Failed to load image: ${relative_src}`);
        $img.remove();
    });
}


function score_dependent_fns() {

    const player_score = game_data.counters.score;
    const { act_limit, boss_limit, bounty_limit } = game_data.limits;

    // --- 1. Level Up Logic ---
    if (player_score >= act_limit && game_data.game_states.traffic_flag) {

        if (game_data.levels.act_level >= GAME_CONSTANTS.MAX_GAME_LEVEL) {
            
            game_data.limits.act_limit = Infinity;
            console.log("INFO: Max level reached. No further level-ups.");
            
            return; 
        }

        game_data.levels.act_level++;
        console.log(`Level Up! New Level: ${game_data.levels.act_level}`);

        // Call game_level_change to load the new level's configuration and calculate its next act_limit
        game_level_change(game_data.levels.act_level);

        update_center_display("+ LEVEL UP +");
        base_level_entities.bazis.lives++;

        access_missed_weapons();

        // --- 2. Bounty Logic (Linked to Level Up) ---
        // This will now use the new bounty_score_threshold from the currentLevelConfig
        bounty_container_controller();
        base_level_entities.powerup.level++;      
    }

    // --- 3. First Bounty Trigger (if it's independent of level up for level 1) ---
    
    if (game_data.levels.act_level === 1 && player_score >= bounty_limit) {
        bounty_container_controller();
        game_data.limits.bounty_limit = Infinity; // Use Infinity instead of a very large number for clarity
        base_level_entities.powerup.level++;          
    }

    // --- 4. UI Updates ---
    $(".eletek_keret").html(`HEALTH :&nbsp <span class='kijelzo_color'>${base_level_entities.bazis.hp}</span> &nbsp/&nbsp LIVES :&nbsp ${base_level_entities.bazis.lives}<span class='atomic_felirat'>: ${game_data.counters.a_bomb}</span>`);

    if ($(".atomic").length === 0) {
        $("<img src='kepek/atomic.png' class='atomic'>").appendTo($(".eletek_keret"));
    }

    // --- 5. Boss Logic ---
    // Initalize Boss level
    if (player_score >= boss_limit) {
        // boss_figyelo();
        game_data.game_states.traffic_flag = false;
        stop_base_level_enemies();                                      
        if (!game_data.game_states.boss_flag ) {
          game_data.game_states.boss_flag = true;
          initalize_boss_level();
    }
        setTimeout(() => {
            explode_all_spacekrafts();
        }, 800);
    }
}


function add_score_n_hit()
{   if( game_data.game_states.traffic_flag){
    game_data.counters.killed++;
}
    const {hit_score_multiplier, hit_score_seed} = current_level_config;
    game_data.counters.score += Math.ceil(Math.random() * hit_score_multiplier) + hit_score_seed;
    score_dependent_fns();   
    update_right_display();
}


function create_background() {
    $(".star").remove();

    const cols = 6;
    const rows = 6;
    
    const win_w = $(window).width();
    const win_h = $(window).height();
    
    const cell_width = win_w / cols;
    const cell_height = win_h / rows;

    function place_star(col, row) {
        unified_image_loader("csillag.gif", (one_star_img) => {
            one_star_img.addClass("star");

            const original_width = one_star_img[0].naturalWidth || 50;
            const original_height = one_star_img[0].naturalHeight || 50;

            const img_height = Math.round(Math.random() * 50) + 20; 
            const img_width = (original_width / original_height) * img_height;

            const pozx = (col * cell_width) + (Math.random() * (cell_width - img_width));
            const pozy = (row * cell_height) + (Math.random() * (cell_height - img_height));

            one_star_img.css({                
                "top": Math.max(0, pozy),
                "left": Math.max(0, pozx),
                "height": img_height,
                "width": img_width
            });
            one_star_img.appendTo($("body")).show();
        });
    }

    // 2. Loop through the 6x6 grid
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            
            place_star(c, r);
        }
    } 
}
