# Diagrammes UML du module Commande (Mermaid)

Ce fichier s'affiche directement sous forme de diagrammes sur GitHub/GitLab,
dans VS Code (extension « Markdown Preview Mermaid Support ») ou sur https://mermaid.live

## Séquence : passer une commande

```mermaid
sequenceDiagram
    actor C as Client
    participant API as OrderController (HTTP)
    participant UC as PlaceOrder
    participant R as OrderRepository
    participant N as Notifier
    C->>API: POST /orders
    API->>UC: handle(cmd)
    UC->>R: save(order)
    R-->>UC: ok
    UC->>N: orderPlaced(order)
    UC-->>API: order
    API-->>C: 201 Created
```

## Classes : le cœur hexagonal

```mermaid
classDiagram
    class Order {
      +id
      +customerId
      +total
      +lines
    }
    class PlaceOrder {
      +handle(cmd) Order
    }
    class OrderRepository {
      <<interface>>
      +save(order)
      +findById(id)
    }
    class InMemoryOrderRepository
    PlaceOrder --> OrderRepository
    PlaceOrder ..> Order : crée
    InMemoryOrderRepository ..|> OrderRepository
```

## États : cycle de vie d'une commande

```mermaid
stateDiagram-v2
    [*] --> Brouillon
    Brouillon --> Confirmée : confirm() [encours OK]
    Brouillon --> EnAttente : confirm() [encours dépassé]
    EnAttente --> Confirmée : validation manuelle
    Confirmée --> Expédiée
    Expédiée --> Livrée
    Livrée --> [*]
```
