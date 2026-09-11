<?php

use Filament\Support\Facades\FilamentAsset;
use MajidShafik\FilamentTableDragScroll\FilamentTableDragScrollServiceProvider;

it('registers the drag scroll assets', function () {
    expect(FilamentAsset::getScriptSrc(
        'table-drag-scroll',
        FilamentTableDragScrollServiceProvider::ASSET_PACKAGE,
    ))->toContain('table-drag-scroll.js')
        ->and(FilamentAsset::getStyleHref(
            'table-drag-scroll',
            FilamentTableDragScrollServiceProvider::ASSET_PACKAGE,
        ))->toContain('table-drag-scroll.css');
});

it('loads the default configuration', function () {
    expect(config('filament-table-drag-scroll.enabled'))->toBeTrue()
        ->and(config('filament-table-drag-scroll.drag_threshold'))->toBe(6)
        ->and(config('filament-table-drag-scroll.excluded_selectors'))->toBeArray();
});
