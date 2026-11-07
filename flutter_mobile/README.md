# FOODHUNT Mobile — Soft Discovery

This is the **first native Flutter design starter** for FOODHUNT. It lives alongside the live
FOODHUNT web app and does **not** replace or migrate its data.

## Current scope

- Material 3, custom rounded design tokens, adaptive light and dark theme
- Functional bottom navigation (Discover, Radar, Saved, Profile)
- Category filter and search on the demo Discover screen
- Clearly labeled demonstration states for Radar and Saved
- No fake restaurant reviews, no automatic GPS requests, no backend credentials

**Not implemented yet:** real radar/GPS, the community data source, account syncing,
the V9 product review editor, and importing the web app's localStorage. These stay
functional in the web app until the native equivalents are built and tested.

## Run locally

Flutter SDK and a supported development environment are required.

```sh
cd flutter_mobile
flutter create --platforms=android,ios --project-name foodhunt_mobile .
flutter pub get
flutter run
```

The generated native project files (Android, iOS) are intentionally not committed
as part of the first design prototype. Running `flutter create .` creates them.
For iOS builds you need a compatible macOS/Xcode environment or a cloud build service.

## Test

```sh
flutter test
```

This repository commit has **not** run the Flutter compiler or device tests: the
Flutter SDK was unavailable in the development environment.

## Integration plan

1. Define a shared, versioned model for restaurant, dish, visit, rating and location.
2. Decide where user data is stored and how browser-local reviews are imported with
   confirmation and backups.
3. Connect user-authenticated repositories and maps/places discovery services; keep
   personal scores distinct from public community reviews.
4. Implement the working FOODHUNT Radar and multi-dish review flows natively.
5. Run Android and iPhone UI tests, including accessibility and offline handling.
6. Introduce a backend suitable for community ratings and multilingual expansion.

## Design direction

See `../docs/FOODHUNT_SOFT_DISCOVERY.md` for tokens, interaction principles and
guidance on keeping FOODHUNT's brand independent from existing delivery platforms.
