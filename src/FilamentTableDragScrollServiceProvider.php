<?php

namespace MajidShafik\FilamentTableDragScroll;

use Filament\Support\Assets\Css;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class FilamentTableDragScrollServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-table-drag-scroll';

    public const ASSET_PACKAGE = 'majid-shafik/filament-table-drag-scroll';

    public function configurePackage(Package $package): void
    {
        $package
            ->name(static::$name)
            ->hasConfigFile();
    }

    public function packageBooted(): void
    {
        if (! config('filament-table-drag-scroll.enabled', true)) {
            return;
        }

        FilamentAsset::register([
            Css::make('table-drag-scroll', __DIR__.'/../resources/css/table-drag-scroll.css'),
            Js::make('table-drag-scroll', __DIR__.'/../resources/js/table-drag-scroll.js')->defer(),
        ], package: self::ASSET_PACKAGE);

        FilamentAsset::registerScriptData([
            'filamentTableDragScroll' => [
                'dragThreshold' => config('filament-table-drag-scroll.drag_threshold', 6),
                'excludedSelectors' => config('filament-table-drag-scroll.excluded_selectors', []),
            ],
        ], package: self::ASSET_PACKAGE);
    }
}
