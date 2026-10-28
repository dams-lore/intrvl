# Produit — AnotherInterval.App

> Nom de code repo : `intrvl`. Anciens noms : ANIA (ANother Intervel App), intrvl. Domaine : anotherinterval.app.

## Quoi
App iPhone de timer et de suivi d'entraînement structuré : CrossFit (For Time, AMRAP, EMOM), HYROX, fractionné running.
Développée en solo par Dams, qui pratique lui-même CrossFit et HYROX.

## Problème résolu
Aucune app ne combine à la fois : création de séances structurées, guidage sur la montre, et capture des temps intermédiaires pendant l'effort sans interrompre l'athlète.

## Cible
Athlètes hybrides qui s'entraînent sérieusement : CrossFit, HYROX, fractionné.

## Positionnement
- Le nom assume la blague (« encore une app d'intervalles »), puis la contre avec le différenciateur : l'import par photo.
- **Différenciateur cœur** : photo / capture d'écran du WOD du coach → Claude Vision le parse → intervalles calibrés sur l'historique de performances perso de l'athlète → guidage pendant la séance → rapport réel vs cible par bloc.
- Ce n'est **pas** un pipeline d'import façon TrainingPeaks. La détection automatique des transitions est une fonctionnalité premium secondaire, pas le pitch principal.

## Différenciateurs à garantir (issus des avis 1-2★ des concurrents)
- Timers sauvegardés + historique des séances (moteur de rétention).
- Alertes visuelles plein écran (mode gym), lisibles dans une salle bruyante.
- UX simple, pas « faite pour des ingénieurs ».
- Ne coupe pas la musique.
- Pas de collecte de données agressive.

Concurrents suivis : SmartWOD Timer, Hyro, Intervals Pro, Edge Fitness, Minuteur Plus / Timer Plus.

## Modèle économique (freemium)
- **Gratuit** : création manuelle de séances, avec une limite de séances sauvegardées.
- **Premium** (~4,99 €/mois ou ~39,99 €/an) : sauvegardes illimitées, import par photo, synchro montre, analytics avancées.
- ⚠️ Tension à trancher : les « timers illimités » sont listés comme moteur de rétention ET comme argument premium. Limiter la sauvegarde en gratuit peut casser la rétention.

## Chantiers produit ouverts
- **Interval score** (oct. 2026) : score partageable sur les réseaux après un WOD, inspiré du score GOWOD, qui mesure à quel point on a suivi les consignes du coach (ex. allure cible). Objectif : traction au lancement, à itérer.
- **My Scores / benchmarks** dans Profile : les PRs running et force existent dans `recordsStore` / `app/records.tsx` mais ne sont pas visibles dans `profile.tsx`.
- **Polar H10** : SDK BLE iOS ouvert avec accéléromètre complet → piste pour la détection auto des transitions sans Apple Watch.

## Hors périmètre de ce repo
Go-to-market, growth (Reddit, SEO, partenariats, UGC, agents growth) : gérés dans le Projet claude.ai et Notion, pas ici.
Principe retenu : organique uniquement, zéro pub payante, la rétention avant l'acquisition.
