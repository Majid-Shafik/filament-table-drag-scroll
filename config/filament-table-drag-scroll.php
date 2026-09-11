<?php

return [
    'enabled' => true,

    'drag_threshold' => 6,

    'excluded_selectors' => [
        'a',
        'button',
        'input',
        'select',
        'textarea',
        'label',
        '[contenteditable="true"]',
        '[draggable="true"]',
        '[role="button"]',
        '[x-sortable-handle]',
        '.fi-ta-reorder-handle',
    ],
];
