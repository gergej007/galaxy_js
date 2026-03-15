/*
$(document).on("keydown", function(e) {
    if (e.keyCode === 116) { // F5 key
        e.preventDefault(); 
        
        console.log("F5 pressed: Performing hard reset (bypassing cache if possible).");
        
        // --- Option 1: Modern Browser Cache Bust ---
        // This is usually the closest you can get to Shift+F5 programmatically.
        // It appends a unique query parameter to the URL, forcing the browser to fetch new resources.
        const url = new URL(window.location.href);
        url.searchParams.set('cache-buster', Date.now()); // Add a unique parameter
        window.location.href = url.toString();        
    }
});
*/

function get_required_enemy_poolsize(game_level) {
 return 20;
}

function get_required_bazis_shot_poolsize(game_level) {
return 20;
}

function get_required_enemy_shot_poolsize(game_level) {
return 20;
}

primary_game_loop();

$(document).ready(
    function () {                         
        kezdo_panel(game_data.counters.score);
        create_background();      
        create_bazis();        
        update_base_entity_rects();  bazis_key_binding();
        
        game_level_change(game_data.levels.act_level);  
        initialize_all_pools(game_data.levels.act_level);                    
                                           
        update_right_display();
        score_dependent_fns();          
    }
);

function bazis_reset() {
    game_data.game_states.exit_flag = true;   
    const bazis_element = $(base_level_entities.bazis.element);
    bazis_element.hide();

    bazis_element.css({
        "left": $(window).width() / 2 - 32,
        "top": $(window).height() - bazis_element.height()
    });
    setTimeout(function () { 
        bazis_element.show();
        game_data.game_states.exit_flag = false;
     }, 1000);
    audio_play("#impact3");
}

function boss_figyelo() {
    game_data.game_states.traffic_flag = false;
    stop_base_level_enemies();                                      // ----> EZ MI?
    if (!game_data.game_states.boss_flag ) {
        game_data.game_states.boss_flag = true;
        initalize_boss_level();
    }
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

// Globals
// BAL FELSÓ KIJELZÖ UPDATE + ÚJ ÉLET HOZZÁADÁS + SZINTLÉPÉS + bounty controller
function score_dependent_fns() {
    const player_score = game_data.counters.score;
    const { boss_limit, next_limit } = game_data.limits;

    if (player_score >= game_data.limits.act_limit && game_data.game_states.traffic_flag){
                
        game_data.levels.act_level++;
       
        game_data.limits.act_limit += next_limit; 

        game_level_change(game_data.levels.act_level);
        update_center_display("+ LEVEL UP +");
        base_level_entities.bazis.lives++;
         // --- 2. Bounty Logic (Linked to Level Up after the first one) ---
        // Every time we level up, we also trigger a bounty and push its limit forward
        bounty_container_controller();
        game_data.limits.bounty_limit = game_data.limits.act_limit; // Keep in sync
        base_level_entities.powerup.level++;
    }

    if (game_data.levels.act_level === 1 && player_score >= game_data.limits.bounty_limit) {
        bounty_container_controller();
       
        game_data.limits.bounty_limit = 999999; 
        base_level_entities.powerup.level++;
    }

      // --- 4. UI Updates ---
    $(".eletek_keret").html(`HEALTH :&nbsp <span class='kijelzo_color'>${base_level_entities.bazis.hp}</span> &nbsp/&nbsp LIVES :&nbsp ${base_level_entities.bazis.lives}<span class='atomic_felirat'>: ${game_data.counters.a_bomb}</span>`);
    
    if ($(".atomic").length === 0) {
        $("<img src='kepek/atomic.png' class='atomic'>").appendTo($(".eletek_keret"));
    }

    // --- 5. Boss Logic ---
    if (player_score >= boss_limit) {
        boss_figyelo();
        setTimeout(() => {
            explode_all_spacekrafts();
        }, 800);
    }
}     


function add_score_n_hit()
{   if( game_data.game_states.traffic_flag){
    game_data.counters.killed++;
}
 
    game_data.counters.score += Math.ceil(Math.random() * talalat_score_multiplier) + talalat_score_seed;
    score_dependent_fns();   
    update_right_display();
}

function css_left(object){                   
    return parseInt($(object).css("left"));
}

function css_top(object){
    return parseInt($(object).css("top"));
}



function create_background() {

    unified_image_loader( "csillag.gif", (one_star_img)=> {
        one_star_img.addClass("star");

        const original_width = one_star_img[0].naturalWidth;
        const original_height = one_star_img[0].naturalHeight;

        if (original_width === 0) return;

        const height = Math.round(Math.random() * 50) + 20;
        const width = (original_width / original_height) * height;
        const pozx = Math.round(Math.random() * $(window).width()) - width - 15;
        const pozy = Math.round(Math.random() * ($(window).height() - 100)) + height;

        one_star_img.css({
            "position" : "absolute",
            "top": pozy,
            "height": height,
            "left": pozx,
            "height": height,
            "width": width
        });
        one_star_img.appendTo($("body")).show();

        if ($(".star").length < 36) {
            setTimeout(function () {
                create_background();
            }, 100);
        }
    });
   
    $(document).keydown(
        function(e){
           if(e.keyCode == 122){            // Toggle  full screen
            $(".star").remove();
            create_background();
           }     
        });    
}
