const GOD_MODE_TIMEOUT = 60000;

function god_mode(){
    weapons.flags.god_mode = true;
    const bazis_data = base_level_entities.bazis;
    if( !bazis_data || !bazis_data.img_element){
        console.warn("God mode quited due to invalid bazis_data!");
        return;
    }
    bazis_data.img_element.attr("src", "kepek/bounties/god_mode.png");
    // const current_bazis_element = $(base_level_entities.bazis.element);
    // current_bazis_element.find(".bazis_img").attr("src", "kepek/bounties/god_mode.png");
    setTimeout(() => {
        weapons.flags.god_mode =false;
        bazis_data.img_element.attr("src", "kepek/bazis.png");
        // current_bazis_element.find(".bazis_img").attr("src", "kepek/bazis.png");
    }, GOD_MODE_TIMEOUT);
}