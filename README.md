# Nourish

A mindfulness-first daily check-in tool for the Light Phone III.

Nourish is not a calorie tracker. It's a lightweight daily log for people who want to be more intentional about what they eat, connecting eating habits with context like stress, sleep, and how the day went. It's meant to be used once a day, in under a minute.

## Features

* Daily check-in with a meal log, signal ratings, and context tags
* Pick up to three nutrition signals to rate (calories, protein, carbs, fat, fiber, added sugar, sodium, water, caffeine)
* Context tags for what affected your day (stress, sleep, travel, etc.)
* An optional free-text note per entry
* A calendar of past entries to see your own patterns
* Nutrition lookup: search for a food and see its nutrition facts by serving size

## Privacy

Your logs are stored on the phone and never leave it. There is no account, analytics, tracking, or advertising.

Nutrition lookup is the only feature that uses the network. When you search, the text you typed is sent to [Open Food Facts](https://world.openfoodfacts.org) (`search.openfoodfacts.org`), and when you open a food, its product code is sent to `us.openfoodfacts.org`. Open Food Facts can see your IP address like any web server. Nothing else is sent. The rest of the tool works offline.

The tool requests only the `INTERNET` and `ACCESS_NETWORK_STATE` permissions.

## Building

The tool lives in `tool/` and builds inside a checkout of [light-sdk](https://github.com/lightphone/light-sdk). Add this to the end of the SDK's `settings.gradle.kts`:

```kotlin
include(":nourish")
project(":nourish").projectDir = file("/path/to/nourish/tool")
```

Then, from the SDK directory:

```
./gradlew :nourish:assembleDebug
```

## Data and attribution

Food data comes from [Open Food Facts](https://world.openfoodfacts.org) and is available under the [Open Database License](https://opendatacommons.org/licenses/odbl/1-0/). Individual contents are under the [Database Contents License](https://opendatacommons.org/licenses/dbcl/1-0/).

## License

[MIT](LICENSE). The Open Food Facts data it displays has its own license, above.

## Support

If any of my tools have been useful to you, I'd love to hear from you! Feel free to reach out [here](mailto:zacksimpson24@gmail.com). Another way to support is to [consider sponsoring](https://github.com/sponsors/zacksimpson).

## Credits

* [iamkory](https://www.reddit.com/user/iamkory/) for the [LighterOS Figma design toolkit](https://www.figma.com/design/1k2PkAjOSet8f9jjVdhM2L/LighterOS?node-id=65-2018&t=3Qd2sXdySZCzTVtK-1), a great reference for the LightOS look
* [Open Food Facts](https://world.openfoodfacts.org), the open nutrition database
* [The Light Phone](https://www.thelightphone.com) for building a phone worth making tools for
