<?php

namespace MajidShafik\FilamentTableDragScroll\Tests;

use MajidShafik\FilamentTableDragScroll\FilamentTableDragScrollServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [
            FilamentTableDragScrollServiceProvider::class,
        ];
    }
}
