# Analyse de menaces STRIDE

## Zones de confiance
| Conteneur / Système | Zone (Section 6.3 CDC) | Niveau de Confiance |
| :--- | :--- | :--- |
| Réseau de Capteurs IoT | IoT (VLAN 40) | Faible |
| Passerelle de Site (Edge) | DMZ locale (VLAN 10) | Faible |
| App Mobile Terrain | Internet Mobile / Flotte gérée | Faible |
| API Centrale / Worker Escalade | Central / LAN applicatif (VLAN 20) | Moyenne |
| Base de Données / Stockage S3 | Central / Données privées | Élevée |
| Fournisseur OIDC / Passerelle SMS | Systèmes Externes | Moyenne |

## Flux qui franchissent une frontière
| Flux | De -> Vers | Protocole | Zones traversées |
| :--- | :--- | :--- | :--- |
| **F1** | Capteurs IoT -> Passerelle Edge | LoRaWAN (868 MHz) | Zone IoT -> DMZ locale |
| **F2** | Passerelle Edge -> Message Broker | MQTT/TLS (Port 8883) | DMZ locale -> Central applicatif |
| **F3** | App Mobile Terrain -> API Centrale | HTTPS / REST / JWT | Internet Mobile -> Central applicatif |
| **F4** | API Centrale -> BDD Centrale | SQL chiffré (Port 5432) | Central applicatif -> Données privées |
| **F5** | API Centrale -> Fournisseur OIDC | HTTPS / OIDC | Central applicatif -> Partenaire externe |
| **F6** | Moteur d'Escalade -> Passerelle SMS | HTTPS / REST | Central applicatif -> Prestataire externe |

## Menaces identifiées
| Flux | STRIDE | Menace concrète | Mesure d'atténuation retenue | Réf. |
| :--- | :---: | :--- | :--- | :--- |
| **F1** | **S** | Usurpation d'un capteur LoRaWAN pour fausser les températures | Déploiement OTAA avec clés AppKey stockées dans un composant cryptographique sécurisé (Secure Element). | CDC 6.3 |
| **F1** | **T** | Rejeu de trames radio pour masquer une anomalie de poids | Utilisation du compteur de trame (*Frame Counter FCnt*) LoRaWAN validé strictement par la passerelle. | UC-T02 |
| **F2** | **I** | Interception des relevés et coordonnées GPS des ruchers en transit | Chiffrement obligatoire du canal via mTLS (X.509) avec validation réciproque des certificats. | ADR 0001 |
| **F3** | **S** | Jeton volé sur un smartphone égaré pour injecter de faux rapports | Jetons révocables à durée de vie courte (15 min) liés à l'empreinte matérielle de l'appareil (*Hardware Device Binding*). | ADR 0002 |
| **F3** | **R** | Un intervenant nie avoir altéré la composition chimique ou sanitaire | Signature cryptographique du payload d'inspection horodatée lors de la validation hors-ligne. | UC-A01 |
| **F3** | **D** | Déni de service par saturation de requêtes de synchronisation | Rate-limiting strict par IP et par ID utilisateur via Fastify Rate-Limit + file d'attente tampon. | CDC 4.2 |
| **F4** | **E** | Injection SQL contournant les contrôles d'accès métier | Utilisation exclusive de requêtes préparées via le mapping Prisma ORM, compte DB restreint au strict schéma. | C4 N3 API |

## Risques résiduels
- **Vol physique d'une passerelle sur un rucher isolé :** Malgré l'accès au conteneur Edge, le chiffrement du stockage local (LUKS/SQLCipher) et la révocation immédiate de son certificat mTLS central limitent l'impact à un seul site. Surveillance assurée par le service SOC/Ops via l'absence de heartbeat supérieur à 120 minutes.
