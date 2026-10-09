import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

const jsCode = fs.readFileSync(path.resolve(__dirname, '../../resources/js/table-drag-scroll.js'), 'utf8');

describe('Table Drag Scroll', () => {
    let container;

    beforeEach(() => {
        document.body.innerHTML = '';
        window.filamentData = {
            filamentTableDragScroll: {
                dragThreshold: 6,
                excludedSelectors: ['a', 'button', 'input', 'select', 'textarea', '[role="button"]', '.fi-ta-reorder-handle']
            }
        };
        
        container = document.createElement('div');
        container.className = 'fi-ta-content-ctn';
        // Mock scrollable properties
        Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true });
        Object.defineProperty(container, 'scrollWidth', { value: 1000, configurable: true });
        Object.defineProperty(container, 'scrollLeft', { value: 0, writable: true, configurable: true });
        
        container.setPointerCapture = vi.fn();
        container.releasePointerCapture = vi.fn();
        container.hasPointerCapture = vi.fn().mockReturnValue(true);
        
        document.body.appendChild(container);
        
        // Reset installed flag
        window.filamentTableDragScrollInstalled = false;
        
        // Execute the script
        eval(jsCode);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    const simulatePointerDrag = (startX, startY, endX, endY, target = container, type = 'mouse') => {
        target.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, pointerType: type, clientX: startX, clientY: startY, isPrimary: true, button: 0, bubbles: true }));
        document.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: type, clientX: endX, clientY: endY, bubbles: true }));
        document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: type, clientX: endX, clientY: endY, bubbles: true }));
    };

    it('scrolls horizontally on mouse drag', () => {
        container.scrollLeft = 100;
        simulatePointerDrag(200, 100, 100, 100);
        expect(container.scrollLeft).toBe(200); // 100 - (100 - 200) = 200
    });

    it('does not scroll if vertical movement is greater than horizontal', () => {
        container.scrollLeft = 100;
        simulatePointerDrag(200, 100, 180, 50); // deltaX = -20, deltaY = -50
        expect(container.scrollLeft).toBe(100); // Should not scroll
    });

    it('does not scroll if movement is below threshold', () => {
        container.scrollLeft = 100;
        simulatePointerDrag(200, 100, 195, 100); // deltaX = -5, threshold is 6
        expect(container.scrollLeft).toBe(100); 
    });

    it('cancels click event after a valid drag', () => {
        let clickFired = false;
        container.addEventListener('click', () => clickFired = true);
        
        container.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, pointerType: 'mouse', clientX: 200, clientY: 100, isPrimary: true, button: 0, bubbles: true }));
        document.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 100, clientY: 100, bubbles: true }));
        document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', clientX: 100, clientY: 100, bubbles: true }));
        
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        container.dispatchEvent(clickEvent);
        
        expect(clickEvent.defaultPrevented).toBe(true);
        expect(clickFired).toBe(false);
    });

    it('allows click event without drag', () => {
        let clickFired = false;
        container.addEventListener('click', () => clickFired = true);
        
        simulatePointerDrag(200, 100, 200, 100); // No movement
        
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        container.dispatchEvent(clickEvent);
        
        expect(clickEvent.defaultPrevented).toBe(false);
        expect(clickFired).toBe(true);
    });

    it('ignores drag on excluded elements', () => {
        const button = document.createElement('button');
        container.appendChild(button);
        container.scrollLeft = 100;
        
        simulatePointerDrag(200, 100, 100, 100, button);
        
        expect(container.scrollLeft).toBe(100);
    });

    it('ignores drag if table is not horizontally scrollable', () => {
        Object.defineProperty(container, 'scrollWidth', { value: 500, configurable: true }); // Equal to clientWidth
        container.scrollLeft = 0;
        
        simulatePointerDrag(200, 100, 100, 100);
        
        expect(container.scrollLeft).toBe(0);
    });

    it('works with multiple tables independently', () => {
        const container2 = document.createElement('div');
        container2.className = 'fi-ta-content-ctn';
        Object.defineProperty(container2, 'clientWidth', { value: 500, configurable: true });
        Object.defineProperty(container2, 'scrollWidth', { value: 1000, configurable: true });
        Object.defineProperty(container2, 'scrollLeft', { value: 100, writable: true, configurable: true });
        container2.setPointerCapture = vi.fn();
        container2.releasePointerCapture = vi.fn();
        container2.hasPointerCapture = vi.fn().mockReturnValue(true);
        document.body.appendChild(container2);
        
        simulatePointerDrag(200, 100, 100, 100, container2);
        
        expect(container2.scrollLeft).toBe(200);
        expect(container.scrollLeft).toBe(0);
    });
    
    it('cancels drag on pointercancel', () => {
        container.scrollLeft = 100;
        container.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, pointerType: 'mouse', clientX: 200, clientY: 100, isPrimary: true, button: 0, bubbles: true }));
        document.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 100, clientY: 100, bubbles: true }));
        document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', clientX: 100, clientY: 100, bubbles: true }));
        
        // Further move should do nothing
        document.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 50, clientY: 100, bubbles: true }));
        
        expect(container.scrollLeft).toBe(200); // Only initial movement happened before cancel
    });
});
