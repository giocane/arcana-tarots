// TAROTLENS — reçoit les commandes (panier.js) et les inscriptions "prévenez-moi du
// retour en stock" (index.html), et les ajoute au Google Sheet. À coller dans
// Extensions > Apps Script du Sheet cible, puis déployer en Web App
// (Exécuter en tant que : Moi — Accès : Tous). Voir le README à côté de ce fichier.

// Comparaison tolérante aux accents mal encodés (NFC/NFD) et aux espaces
// parasites, pour ne jamais retomber silencieusement sur getActiveSheet().
function findSheet(ss, name) {
    var target = name.normalize('NFC').trim();
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
        if (sheets[i].getName().normalize('NFC').trim() === target) return sheets[i];
    }
    return null;
}

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
        var data = JSON.parse(e.postData.contents);
        var ss = SpreadsheetApp.getActiveSpreadsheet();

        if (data.type === 'stock_interest') {
            var stockSheet = findSheet(ss, 'Intérêts stock');
            if (!stockSheet) {
                throw new Error('Onglet "Intérêts stock" introuvable. Onglets existants : '
                    + ss.getSheets().map(function (s) { return '[' + s.getName() + ']'; }).join(', '));
            }
            stockSheet.appendRow([
                new Date(),
                data.email || '',
                data.product || '',
                data.lang || '',
            ]);
        } else {
            var orderSheet = findSheet(ss, 'Commandes') || ss.getActiveSheet();
            var itemsSummary = (data.items || [])
                .map(function (it) { return it.name + ' x' + it.qty; })
                .join(', ');

            orderSheet.appendRow([
                new Date(),
                data.name || '',
                data.email || '',
                data.phone || '',
                data.address || '',
                itemsSummary,
                data.subtotal || '',
                data.lang || '',
            ]);
        }

        return ContentService
            .createTextOutput(JSON.stringify({ ok: true }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}
