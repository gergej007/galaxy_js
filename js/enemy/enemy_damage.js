/**
 * Processes damage dealt to an enemy spacekraft, provides visual hit feedback,
 * and manages the enemy's lifecycle upon destruction.
 * 
 * This function subtracts the player's damage from the enemy's current HP.
 * If HP drops below 1, it triggers an explosion. Otherwise, it applies 
 * a brief visual "red flash" filter to the enemy element.
 *
 * @param {object} enemy_data - The data object for the enemy from the pool.
 *                              Expects { element: jQuery, hp: number, is_active: boolean }.
 * @returns {void}
 */
function enemy_damage( enemy_data, damage) {

    if (!enemy_data || !enemy_data.is_active) return;    

    enemy_data.hp -= damage;   

    if( enemy_data.hp < 1){
        explode_spacekraft( enemy_data);
        return;
    }

    const elem = $(enemy_data.element);
        
    elem.css({ filter: "brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5)" });
      
    setTimeout(() => {
        if (enemy_data.is_active) {
            elem.css({ filter: "none" });
        }
    }, 80);    
}