/**
 * Generic guard to check if a game entity has its required components.
 * @param {Object} entity_data - The object to check (enemy, bazis, bounty, etc.)
 * @returns {boolean} True if the entity is valid and ready for use.
 */
function is_entity_valid(entity_data) {
    // Returns true only if the data exists AND has both an element and a rect
    return !!(entity_data?.element && entity_data?.rect);
}


/**
 * Validates if an entity is initialized and active on the game board.
 * @param {Object} entity - The entity object to validate.
 * @param {boolean} check_position - If true, ensures the entity isn't at (0,0).
 */
// function is_entity_valid(entity, check_position = false) {
//     // 1. Basic existence check
//     const bazis_valid = !!(entity?.element?.length && entity?.rect);
    
//     if (!bazis_valid) return false;

//     // 2. Optional: check if it's been moved out of the "zero state"
//     if (check_position) {
//         const is_at_zero = entity.rect.top === 0 && entity.rect.left === 0;
//         return !is_at_zero;
//     }

//     return true;
// }
