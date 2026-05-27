# Nourish

> ⚠️ **This project is in early alpha and is not ready for general use.** Expect breaking changes, missing features, and rough edges. No APK is available for download yet.

A mindfulness-first daily check-in tool for the Light Phone III.

Nourish is not a calorie tracker. It's a lightweight daily log for people who want to be more intentional about what they eat – connecting eating habits with context like stress, sleep, and how the day went. Built to be used once a day, in under a minute.

Built with [vandamd's light-template](https://github.com/vandamd/light-template) – a community-made Expo template for building LightOS-style apps for the Light Phone III.

---

## Planned Features

* Daily check-in with meal log, signal ratings, and context tags
* Configurable nutrition signals (calories, protein, carbs, fat)
* Context tags to track what affected your day (stress, sleep, travel, etc.)
* Optional free-text note per entry
* Scrollable log of past entries
* Food lookup via USDA FoodData Central API
* Respects LightOS theme (black/white mode)

---

## Installing on Light Phone III

This app is not yet available for download. Check back once a stable release is published.

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
* [The Light Phone](https://www.thelightphone.com) — for building a phone worth making apps for
* [USDA FoodData Central](https://fdc.nal.usda.gov) — nutrition data provided by the U.S. Department of Agriculture
