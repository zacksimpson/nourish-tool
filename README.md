# Nourish



A mindfulness-first daily check-in tool for the Light Phone III.

Nourish is not a calorie tracker. It's a lightweight daily log for people who want to be more intentional about what they eat – connecting eating habits with context like stress, sleep, and how the day went. Built to be used once a day, in under a minute.

Built with [vandamd's light-template](https://github.com/vandamd/light-template) – a community-made Expo template for building LightOS-style apps for the Light Phone III.

---

## Features

* Daily check-in with meal log, signal ratings, and context tags
* Configurable nutrition signals (calories, protein, carbs, fat)
* Context tags to track what affected your day (stress, sleep, travel, etc.)
* Optional free-text note per entry to provide additional context
* View your log of past entries to better understand your own patterns and habits
* Nutrition Lookup - search for a food to find its nutrition facts, configurable by serving size

---

## Installing on Light Phone III


> ⚠️  **This project is in early development and is not ready for production.** Expect breaking changes, missing features, and rough edges. That being said, feel free to download and contribute to its development, and give feedback on its direction!

I highly recommend using Obtainium to ensure you receive future updates and new features automatically. Just add [the repo URL,](https://github.com/zacksimpson/nourish-tool/) make sure you're able to install apps from unknown sources, and you're all set.

Alternatively, you can download the latest APK from the Releases tab.

---

## Building

This project uses [Expo](https://expo.dev) and [EAS Build](https://docs.expo.dev/build/introduction/).

### Prerequisites

* [Bun](https://bun.sh)
* [EAS CLI](https://docs.expo.dev/build/setup/)
* An Expo account

### Steps
* bun install
* eas login
* eas build --platform android --profile preview

EAS will build the APK in the cloud and provide a download link.

---

## Credits

* [vandamd](https://github.com/vandamd) — [light-template](https://github.com/vandamd/light-template), the community Expo template this app is built on
* [iamkory](https://www.reddit.com/user/iamkory/) — [LighterOS Figma design toolkit](https://www.figma.com/design/1k2PkAjOSet8f9jjVdhM2L/LighterOS?node-id=65-2018&t=3Qd2sXdySZCzTVtK-1), excellent reference for recreating the LightOS aesthetic
* [USDA FoodData Central](https://fdc.nal.usda.gov) — nutrition data provided by the U.S. Department of Agriculture
* [The Light Phone](https://www.thelightphone.com) — for building a phone worth making apps for
