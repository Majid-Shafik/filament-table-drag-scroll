# Publishing checklist

1. Create a public GitHub repository named `filament-table-drag-scroll` under the `Majid-Shafik` account.
2. Copy this package directory's contents to the repository root.
3. Push the `main` branch and confirm that GitHub Actions pass.
4. Create and push the first stable tag:

   ```bash
   git tag -a v1.0.0 -m "Initial release"
   git push origin v1.0.0
   ```

5. Submit `https://github.com/Majid-Shafik/filament-table-drag-scroll` to Packagist.
6. Confirm that Packagist detects version `v1.0.0`.
7. Sign in at `https://filamentphp.com/author` with GitHub and use **Submit plugins** to submit the Packagist package.
8. Add screenshots or a short GIF demonstrating drag behavior before submission if available.

Do not publish the tag until installation has been tested in a clean Filament 5 application.
