// QueenBee · contexte « Santé des colonies »  —  KIT DE DÉPART (TP 5, parcours Dev)
// AGRÉGAT Alerte : racine unique, invariants protégés, événements du domaine.
// Le cycle de vie est géré avec le pattern State : AUCUN switch sur le statut.
//
//   LEVÉE ──assigner──▶ PRISE_EN_CHARGE ──résoudre──▶ RÉSOLUE
//     │                        ▲
//     └──escalader (≥ 48 h)──▶ ESCALADÉE ──assigner──┘
//
// Ce qui est fourni : la structure, l'état LEVÉE → PRISE_EN_CHARGE (exemple),
// la collecte des événements. À vous : les TODO (numérotés dans l'ordre conseillé).
// Vérification : npm run tp5  (12 tests ; 4 passent au départ).

export const TYPES_DE_RISQUE = ['ESSAIMAGE', 'AFFAIBLISSEMENT', 'STRESS_THERMIQUE', 'MORTALITE'];
export const DELAI_ESCALADE_MS = 48 * 60 * 60 * 1000;

const iso = d => new Date(d).toISOString();
const aFaire = n => { throw new Error(`TODO ${n} : à implémenter`); };

// ---------------------------------------------------------------- états
const Levee = {
  nom: 'LEVÉE',
  // Exemple fourni : une transition = changer d'état + enregistrer un événement
  assigner(alerte, apicultriceId, at) {
    alerte._passer(PriseEnCharge, { type: 'AlertePriseEnCharge', apicultriceId, at: iso(at) });
  },
  escalader(alerte, at) {
    // TODO 4 : refuser si l'alerte n'est pas en retard (message contenant « 48 h »),
    //          sinon passer à l'état Escaladee avec l'événement « AlerteEscaladée »
    aFaire(4);
  },
  resoudre() {
    // TODO 3 : refuser (message contenant « prise en charge »)
    aFaire(3);
  },
};

const PriseEnCharge = {
  nom: 'PRISE_EN_CHARGE',
  assigner() { aFaire('5a'); },            // TODO 5a : refuser (déjà prise en charge)
  escalader() { aFaire('5b'); },           // TODO 5b : refuser
  resoudre(alerte, inspectionId, at) {     // TODO 5c : passer à Resolue, événement « AlerteRésolue »
    aFaire('5c');                          //           (exiger un inspectionId)
  },
};

const Escaladee = {
  nom: 'ESCALADÉE',
  assigner(alerte, apicultriceId, at) { aFaire('6a'); }, // TODO 6a : comme depuis LEVÉE
  escalader() { aFaire('6b'); },                          // TODO 6b : refuser (déjà escaladée)
  resoudre() { aFaire('6c'); },                           // TODO 6c : refuser
};

const Resolue = {
  nom: 'RÉSOLUE',
  // TODO 7 : plus aucune transition possible (trois refus explicites)
  assigner() { aFaire(7); },
  escalader() { aFaire(7); },
  resoudre() { aFaire(7); },
};

// ---------------------------------------------------------------- agrégat
export class Alerte {
  #etat = Levee;
  #events = [];

  constructor({ id, hiveId, siteId, risque, confiance, leveeLe }) {
    Object.assign(this, { id, hiveId, siteId, risque, confiance, leveeLe: new Date(leveeLe) });
  }

  /** Fabrique : seul moyen de créer une alerte valide. */
  static lever({ id, hiveId, siteId, type, confiance, at }) {
    // TODO 1 : invariants — type présent dans TYPES_DE_RISQUE (message « Type de risque… »)
    // TODO 2 : invariants — confiance numérique entre 0 et 1 (message contenant « confiance »)
    const alerte = new Alerte({ id, hiveId, siteId, risque: type, confiance, leveeLe: at });
    alerte.#events.push({ type: 'AlerteLevée', alerteId: id, hiveId, siteId, risque: type, confiance, at: iso(at) });
    return alerte;
  }

  get statut() { return this.#etat.nom; }

  assigner(apicultriceId, at) { this.#etat.assigner(this, apicultriceId, at); }
  escalader(at) { this.#etat.escalader(this, at); }
  resoudre(inspectionId, at) { this.#etat.resoudre(this, inspectionId, at); }

  /** Règle métier : une alerte restée LEVÉE 48 h sans prise en charge est en retard. */
  estEnRetard(now) {
    // TODO 4 (suite) : vrai si l'état est Levee et si now - leveeLe >= DELAI_ESCALADE_MS
    return aFaire(4);
  }

  /** Événements produits depuis le dernier appel (consommés une seule fois). */
  pullEvents() {
    const e = this.#events;
    this.#events = [];
    return e;
  }

  /** Réservé aux objets état de ce module : change d'état et enregistre l'événement. */
  _passer(etat, event) {
    this.#etat = etat;
    this.#events.push({ ...event, alerteId: this.id, hiveId: this.hiveId });
  }
}
