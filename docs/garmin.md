# Garmin Connect IQ — Vivoactive 5

> ⚠️ **Le code Monkey C n'est pas dans ce repo** (vérifié le 28/10/2026 : aucun fichier `.mc` ni `manifest.xml`). Il n'existe que sur le PC de Dams, donc il n'est ni sauvegardé ni visible par les agents. Ticket T-001 : le rapatrier dans `watch-garmin/`.

## État
- Fichiers : `IntrvlWatchApp.mc`, `IntrvlWatchView.mc`, `CommManager.mc`, `WorkoutInputDelegate.mc` (+ `manifest.xml`, ressources).
- Build et exécution OK dans le simulateur Vivoactive 5 : compte à rebours, nom du bloc, indicateur de round, allure cible, vitesse GPS (reçus en messages JSON).
- Déployé sur la vraie montre par USB (`.prg` copié dans `GARMIN/APPS/`), fonctionne avec la fréquence cardiaque en direct.
- Refonte design commencée, **build final non terminé** : arc de progression, labels en pilule, ligne de données sur 3 colonnes, FC toujours visible (`Sensor.SENSOR_HEARTRATE`).

## Architecture de communication
iPhone (app) → app Garmin Connect iOS → BLE → Vivoactive 5.
Côté iPhone : nécessite un module natif → Development Build (Codemagic), impossible dans Expo Go.
`store/heartRateStore.ts` prévoit déjà les sources `'garmin' | 'ble' | 'healthkit'`.

## Outillage (PC Windows)
- Connect IQ SDK Manager v9.1.0, Java 17 Temurin.
- Extension VS Code Monkey C (installée via `.vsix`).
- OpenSSL de Git for Windows pour générer la clé développeur.
- ⚠️ La clé développeur (`*.der` / `*.pem`) ne doit **jamais** être commitée (`*.pem` est déjà dans `.gitignore`, ajouter `*.der`).

## Gotchas
Voir `docs/learnings.md` § Connect IQ.
