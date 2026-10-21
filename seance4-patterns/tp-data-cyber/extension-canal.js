// B1 · Étendre sans modifier : ajouter le canal « sms-groupe » à la fabrique de notifications
// (un SMS envoyé à toutes les apicultrices d'une coopérative). factory.js ne doit PAS être modifié.
import { Notification, registerChannel } from '../creationnels/factory.js';

// TODO B1.1 : créer la classe SmsGroupeNotification (elle hérite de Notification)
//             send(msg) doit renvoyer `[SMS-GROUPE] ${msg}`
export class SmsGroupeNotification extends Notification {}

export function installerCanalGroupe() {
  // TODO B1.2 : enregistrer la classe sous le nom 'sms-groupe' (une seule ligne)
}
