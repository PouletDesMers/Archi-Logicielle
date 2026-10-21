// Bridge : deux axes qui varient indépendamment (type d'alerte × canal d'envoi).

// Axe « implémentation » : OÙ envoyer ?
class ConsoleSender {
  send(text) {
    console.log(`  [console] ${text}`);
  }
}
class FileSender {
  lines = [];
  send(text) {
    this.lines.push(text);
    console.log(`  [fichier] ligne ${this.lines.length} écrite`);
  }
}
class SlackSender {
  send(text) {
    console.log(`  [slack #ops] ${text.replaceAll('\n', ' | ')}`);
  }
}

// Axe « abstraction » : QUEL message ?
class Alert {
  constructor(sender) {
    this.sender = sender;
  } // ← le « pont »
  notify(payload) {
    this.sender.send(this.format(payload));
  }
  format(payload) {
    return String(payload);
  }
}
class UrgentAlert extends Alert {
  format(msg) {
    return `[URGENT] ${msg.toUpperCase()}`;
  }
}
class DigestAlert extends Alert {
  format(msgs) {
    return `Résumé (${msgs.length}) :\n- ${msgs.join('\n- ')}`;
  }
}

// N abstractions + M implémentations = N + M classes, mais N × M combinaisons
new UrgentAlert(new SlackSender()).notify('base de données indisponible');
new UrgentAlert(new ConsoleSender()).notify('disque plein à 95 %');
new DigestAlert(new SlackSender()).notify(['build OK', 'tests OK', 'déploiement OK']);
new DigestAlert(new FileSender()).notify(['sauvegarde OK']);
