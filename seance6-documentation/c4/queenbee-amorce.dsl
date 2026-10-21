// QueenBee · amorce de modèle C4 (Structurizr DSL) — exemple vu en séance 6
// À COMPLÉTER pour le dossier du 30/10 :
//   - niveau 1 : vue systemContext (acteurs + systèmes externes : bailleurs, Firebase, e-mail…)
//   - niveau 2 : conteneurs manquants (data warehouse, n8n, SIEM, supervision…)
//   - niveau 3 : au moins une vue component (ex. API centrale ou Ingestion)
// Visualiser : https://playground.structurizr.com (coller le fichier, choisir la vue)
workspace "QueenBee" {
  model {
    api_ = person "Apicultrice" "Inspections, alertes"
    coord = person "Coordinateur régional"
    gest = person "Gestionnaire BeeAfrica"
    meteo = softwareSystem "OpenWeatherMap" "Météo" "Externe"
    qb = softwareSystem "QueenBee" {
      app = container "App terrain" "PWA offline-first"
      web = container "Dashboard web" "Coordination"
      edge = container "Passerelle de site" "Cache, edge"
      mqtt = container "Broker MQTT" "Sync différée"
      ing = container "Ingestion" "Validation, dédup"
      core = container "API centrale" "Cas d'utilisation"
      db = container "Base" "PostgreSQL + PostGIS"
    }
    api_ -> app "Saisit une inspection"
    coord -> web "Priorise les visites"
    gest -> web "Consulte l'impact"
    edge -> mqtt "Mesures (MQTT/TLS)"
    mqtt -> ing "Trames"
    ing -> db "Mesures validées"
    app -> core "Synchronise (HTTPS)"
    core -> db "SQL"
    ing -> meteo "Météo"
  }
  views { container qb { include * } }
}
