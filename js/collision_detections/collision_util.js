/**
 * Performs Axis-Aligned Bounding Box (AABB) collision detection between two rectangular objects.
 * This function checks if two DOMRect objects are overlapping in 2D space.
 *
 * @param {DOMRect} rect1 - The DOMRect object of the first rectangular entity.
 * @param {DOMRect} rect2 - The DOMRect object of the second rectangular entity.
 * @returns {boolean} True if the two rectangles are overlapping, false otherwise.
 */
function check_collision(rect1, rect2) {
    if (!rect1 || !rect2) return false;
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}