workspace "QueenBee" "Plateforme apicole de gestion et de monitoring BeeAfrica" {

    model {
        // --- 1. PERSONNES (N1) ---
        apicultrice = person "Apicultrice" "Inspecte les ruches sur le terrain, même hors ligne."
        veterinaire = person "Vétérinaire apicole" "Surveille la santé des colonies et analyse les alertes sanitaires."
        coordinateur = person "Coordinateur régional" "Planifie les tournées et gère la logistique des ruchers."
        administrateur = person "Responsable d'exploitation" "Supervise l'ensemble du parc, les comptes et les accès."

        // --- 2. SYSTÈMES EXTERNES (N1) ---
        capteurs = softwareSystem "Réseau de Capteurs IoT" "Capteurs de température, humidité et pesée de ruche." "Externe"
        meteo = softwareSystem "Fournisseur Météo" "Fournit les prévisions climatiques et alertes orages via API." "Externe"
        fournisseurSms = softwareSystem "Passerelle SMS / Push" "Envoie les SMS d'urgence sanitaire aux techniciens." "Externe"
        fournisseurId = softwareSystem "Fournisseur d'Identité OIDC" "Gestion centralisée des identités et authentification." "Externe"

        // --- 3. SYSTÈME QUEENBEE ---
        queenbee = softwareSystem "QueenBee" "Système central et distribué de gestion apicole." {

            // --- CONTENEURS (N2) ---
            appTerrain = container "App Mobile Terrain" "Saisie des inspections hors-ligne et synchronisation." "Flutter / SQLite"
            portailWeb = container "Portail Web Métier" "Interface de supervision, planification et analytics." "React / TypeScript"
            
            apiCentrale = container "API Centrale" "Cœur métier et règles applicatives." "Node.js 22 / Fastify" {
                // --- COMPOSANTS DU N3 DEV ---
                modAuth = component "Module IAM & Contexte" "Gestion des jetons, droits RBAC et sessions." "Node.js"
                modInspection = component "Module Inspections" "Logique de synchronisation et détection des conflits." "Node.js"
                modSante = component "Module Santé & Ruches" "Gestion du statut sanitaire des colonies." "Node.js"
                modPlanif = component "Module Planification" "Planification et assignation des tournées." "Node.js"
                portDb = component "Adaptateur Persistance" "Couche d'accès aux données PostgreSQL via repository." "Prisma ORM"
                portBroker = component "Adaptateur Événements" "Consommateur et producteur d'événements asynchrones." "MQTT Client"
            }

            baseCentrale = container "Base de Données Centrale" "Stockage transactionnel principal (ruchers, inspections)." "PostgreSQL 16" "Database"
            brokerEvents = container "Message Broker" "Échange asynchrone des alertes et des mesures terrain." "Mosquitto MQTT"
            passerelleSite = container "Passerelle de Site (Edge)" "Collecte locale LoRaWAN, cache et téléversement." "Go / SQLite local"
            moteurRegles = container "Moteur d'Escalade" "Déclenchement des alertes et escalades à 48h." "Node.js Worker"
            stockageFichiers = container "Stockage d'Objets" "Stockage sécurisé des photos de cadres et rapports." "MinIO / S3" "Database"

            // --- RELATIONS INTERNES ---
            // N3 Relations
            modInspection -> portDb "Persiste les relevés d'inspection" "TypeScript"
            modSante -> portDb "Met à jour le statut des ruches" "TypeScript"
            modPlanif -> portDb "Gère les plannings" "TypeScript"
            portDb -> baseCentrale "Exécute requêtes et transactions" "SQL"
            portBroker -> brokerEvents "Souscrit aux topics d'alertes" "MQTT"
            modSante -> portBroker "Publie changement de statut ruche" "TypeScript"

            // N2 Relations
            appTerrain -> apiCentrale "Synchronise les inspections et lots de données" "HTTPS/JSON"
            portailWeb -> apiCentrale "Consulte et administre les ruchers" "HTTPS/JSON"
            apiCentrale -> stockageFichiers "Lit et stocke les photos d'inspection" "S3 API"
            passerelleSite -> brokerEvents "Publie les télémesures consolidées" "MQTT/TLS"
            moteurRegles -> brokerEvents "Consomme les événements sanitaires" "MQTT"
            moteurRegles -> baseCentrale "Met à jour les alertes non traitées" "SQL"
        }

        // --- RELATIONS EXTERNES (N1 & N2) ---
        apicultrice -> appTerrain "Saisit les inspections" "UI locale"
        veterinaire -> portailWeb "Consulte les indicateurs sanitaires" "HTTPS"
        coordinateur -> portailWeb "Planifie les tournées" "HTTPS"
        administrateur -> portailWeb "Administre les comptes" "HTTPS"

        capteurs -> passerelleSite "Transmet les métriques de ruche" "LoRaWAN"
        apiCentrale -> meteo "Récupère les relevés météo" "HTTPS/JSON"
        moteurRegles -> fournisseurSms "Déclenche l'envoi d'alertes critiques" "HTTPS/REST"
        apiCentrale -> fournisseurId "Valide les jetons d'accès" "OIDC/JWT"
    }

    views {
        systemContext queenbee "N1-Contexte" {
            include *
            autolayout tb
        }

        container queenbee "N2-Conteneurs" {
            include *
            autolayout tb
        }

        component apiCentrale "N3-API-Centrale" {
            include *
            autolayout lr
        }

        styles {
            element "Person" {
                shape Person
                background #08427b
                color #ffffff
            }
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "Component" {
                background #85bbf0
                color #000000
            }
            element "Database" {
                shape Cylinder
                background #1a5276
                color #ffffff
            }
            element "Externe" {
                background #7f8c8d
                color #ffffff
            }
        }
    }
}