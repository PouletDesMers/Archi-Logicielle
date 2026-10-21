# Analyse de menaces simple sur le C4 de QueenBee (méthode STRIDE)

Obligatoire pour les binômes Cyber · conseillée pour tous.

1. Sur le C4 niveau 2, tracer les **zones de confiance** (ex. IoT, site, cloud central, terminal mobile).
2. Lister les **flux qui traversent une frontière** de confiance.
3. Pour chaque flux, chercher les menaces **STRIDE** : Spoofing (usurpation), Tampering (falsification),
   Repudiation (répudiation), Information disclosure (fuite), Denial of service, Elevation of privilege.
4. Proposer **une mesure par menace** ; la décision la plus structurante devient l'**ADR de spécialité**.

| Flux (C4 niveau 2) | Frontière traversée | Menace (STRIDE) | Mesure proposée | Référence CDC |
|---|---|---|---|---|
| Passerelle → Broker MQTT | site → central | S : … | … | 8.2 |
| … | … | … | … | … |

## Risques résiduels
<Ce qui n'est pas couvert, et pourquoi c'est acceptable pour l'instant.>
