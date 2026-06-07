// Canva team invite URLs with slot tracking
// Smart selector picks team with most slots remaining

const fs = require('fs');
const path = require('path');

const TEAM_INVITES = [
    { name: 'Canva 13', initialSlots: 91, url: 'https://www.canva.com/brand/join?token=2-vJUix1GmHR4SG9vLM5QQ&referrer=team-invite' },
    { name: 'Canva 20', initialSlots: 84, url: 'https://www.canva.com/brand/join?token=lgLh4GlbuR6VB9wpvu9aLw&referrer=team-invite' },
    { name: 'Canva 21', initialSlots: 83, url: 'https://www.canva.com/brand/join?token=uLXX0aCm3PkyGp3rOv5-Gg&referrer=team-invite' },
    { name: 'Canva 19', initialSlots: 83, url: 'https://www.canva.com/brand/join?token=lXqPfuBEf96tPiknXTO59g&referrer=team-invite' },
    { name: 'Canva 17', initialSlots: 78, url: 'https://www.canva.com/brand/join?token=6G0yvtTT_pauDuF0-7mqPA&referrer=team-invite' },
    { name: 'Canva 14', initialSlots: 67, url: 'https://www.canva.com/brand/join?token=rJw8R0KlN9pGL7zyr_SOFw&referrer=team-invite' },
    { name: 'Canva 15', initialSlots: 63, url: 'https://www.canva.com/brand/join?token=qignuspiHJjc8gWJr18HGg&referrer=team-invite' },
    { name: 'Canva 18', initialSlots: 32, url: 'https://www.canva.com/brand/join?token=QyJcE5SIIzgvcIJErPOOnQ&referrer=team-invite' },
    { name: 'Canva 16', initialSlots: 23, url: 'https://www.canva.com/brand/join?token=xBzkTF4D7ygp0C2yqleKjg&referrer=team-invite' }
];

const USAGE_FILE = path.join(__dirname, '..', 'team-usage.json');

function loadUsage() {
    if (!fs.existsSync(USAGE_FILE)) {
        const initial = {};
        for (const t of TEAM_INVITES) {
            initial[t.name] = { used: 0, slotsRemaining: t.initialSlots };
        }
        fs.writeFileSync(USAGE_FILE, JSON.stringify(initial, null, 2));
        return initial;
    }
    return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
}

function saveUsage(usage) {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2));
}

function pickBestTeam() {
    const usage = loadUsage();
    let best = null;
    for (const t of TEAM_INVITES) {
        const u = usage[t.name] || { slotsRemaining: t.initialSlots };
        if (u.slotsRemaining > 0) {
            if (!best || u.slotsRemaining > best.slotsRemaining) {
                best = { name: t.name, url: t.url, slotsRemaining: u.slotsRemaining };
            }
        }
    }
    return best;
}

function decrementTeam(teamName) {
    const usage = loadUsage();
    if (!usage[teamName]) {
        const t = TEAM_INVITES.find(x => x.name === teamName);
        usage[teamName] = { used: 0, slotsRemaining: t ? t.initialSlots : 0 };
    }
    usage[teamName].used += 1;
    usage[teamName].slotsRemaining = Math.max(0, usage[teamName].slotsRemaining - 1);
    saveUsage(usage);
}

function getTotalSlotsRemaining() {
    const usage = loadUsage();
    let total = 0;
    for (const t of TEAM_INVITES) {
        const u = usage[t.name] || { slotsRemaining: t.initialSlots };
        total += u.slotsRemaining;
    }
    return total;
}

module.exports = {
    pickBestTeam,
    decrementTeam,
    getTotalSlotsRemaining,
    TEAM_INVITES
};
