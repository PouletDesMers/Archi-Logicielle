workspace "ShopLite" "Modèle C4 de l'application fil rouge" {
    model {
        client = person "Client" "Achète des produits en ligne"
        admin = person "Gestionnaire" "Gère le catalogue et les commandes"
        psp = softwareSystem "Prestataire de paiement" "Système externe" "Externe"

        shop = softwareSystem "ShopLite" {
            spa = container "Front SPA" "Interface web" "Vue.js"
            api = container "API Commandes" "Cas d'utilisation Commande" "Node.js" {
                ctrl = component "OrderController" "Adaptateur HTTP"
                place = component "PlaceOrder" "Cas d'utilisation"
                repo = component "OrderRepository" "Port + adaptateur PostgreSQL"
            }
            db = container "Base de données" "Commandes et clients" "PostgreSQL"
        }

        client -> spa "Passe commande"
        admin -> spa "Administre"
        spa -> ctrl "JSON/HTTPS"
        ctrl -> place "Appelle"
        place -> repo "Enregistre la commande"
        repo -> db "SQL"
        place -> psp "Débite la carte" "HTTPS"
    }
    views {
        systemContext shop "Contexte" { include * autolayout lr }
        container shop "Conteneurs" { include * autolayout lr }
        component api "Composants" { include * autolayout lr }
        styles {
            element "Externe" { background #999999 }
        }
    }
}
