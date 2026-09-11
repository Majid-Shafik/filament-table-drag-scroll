(() => {
    'use strict';

    if (window.filamentTableDragScrollInstalled) {
        return;
    }

    window.filamentTableDragScrollInstalled = true;

    const settings = window.filamentData?.filamentTableDragScroll ?? {};
    const configuredThreshold = Number(settings.dragThreshold);
    const dragThreshold = Number.isFinite(configuredThreshold)
        ? Math.max(1, configuredThreshold)
        : 6;
    const excludedSelectors = Array.isArray(settings.excludedSelectors)
        ? settings.excludedSelectors.filter((selector) => typeof selector === 'string' && selector.length)
        : [];
    const interactiveSelector = excludedSelectors.join(',');
    const containerSelector = '.fi-ta-content-ctn';

    let dragState = null;
    let suppressedClickContainer = null;
    let suppressedClickTimer = null;

    const getContainer = (target) => {
        if (!(target instanceof Element)) {
            return null;
        }

        return target.closest(containerSelector);
    };

    const isHorizontallyScrollable = (container) => (
        container.scrollWidth > container.clientWidth + 1
    );

    const refreshScrollableState = (container) => {
        container.classList.toggle(
            'fi-table-drag-scrollable',
            isHorizontallyScrollable(container),
        );
    };

    const finishDrag = (event = null) => {
        if (!dragState) {
            return;
        }

        if (event && event.pointerId !== dragState.pointerId) {
            return;
        }

        const { container, dragged, pointerId } = dragState;

        if (container.hasPointerCapture(pointerId)) {
            container.releasePointerCapture(pointerId);
        }

        document.documentElement.classList.remove('fi-table-drag-scroll-active');
        dragState = null;

        if (!dragged) {
            return;
        }

        suppressedClickContainer = container;
        window.clearTimeout(suppressedClickTimer);
        suppressedClickTimer = window.setTimeout(() => {
            suppressedClickContainer = null;
        }, 0);
    };

    document.addEventListener('pointerover', (event) => {
        if (event.pointerType !== 'mouse') {
            return;
        }

        const container = getContainer(event.target);

        if (container) {
            refreshScrollableState(container);
        }
    }, { passive: true });

    document.addEventListener('pointerdown', (event) => {
        const target = event.target;

        if (
            event.pointerType !== 'mouse'
            || ! event.isPrimary
            || event.button !== 0
            || ! (target instanceof Element)
            || (interactiveSelector && target.closest(interactiveSelector))
        ) {
            return;
        }

        const container = getContainer(target);

        if (! container) {
            return;
        }

        refreshScrollableState(container);

        if (! isHorizontallyScrollable(container)) {
            return;
        }

        dragState = {
            container,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startScrollLeft: container.scrollLeft,
            dragged: false,
        };
    });

    document.addEventListener('pointermove', (event) => {
        if (! dragState || event.pointerId !== dragState.pointerId) {
            return;
        }

        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;

        if (! dragState.dragged) {
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) >= dragThreshold) {
                finishDrag(event);

                return;
            }

            if (Math.abs(deltaX) < dragThreshold) {
                return;
            }

            dragState.dragged = true;
            dragState.container.setPointerCapture(event.pointerId);
            document.documentElement.classList.add('fi-table-drag-scroll-active');
        }

        event.preventDefault();
        dragState.container.scrollLeft = dragState.startScrollLeft - deltaX;
    }, { passive: false });

    document.addEventListener('pointerup', finishDrag);
    document.addEventListener('pointercancel', finishDrag);
    window.addEventListener('blur', () => finishDrag());

    document.addEventListener('dragstart', (event) => {
        if (dragState) {
            event.preventDefault();
        }
    }, true);

    document.addEventListener('click', (event) => {
        if (! suppressedClickContainer?.contains(event.target)) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        suppressedClickContainer = null;
        window.clearTimeout(suppressedClickTimer);
    }, true);
})();
