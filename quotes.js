const quotes = {
  opened: [
    "Respect my authoritah!"
  ],
  synchronize: [
    "Whateva! I do what I want!",
    "No Kitty, that's my pot pie!",
    "I Want My Cheesy Poofs!",
    "Cartmanbrah!"
  ],
  review_requested: [
    "But Mooooom!",
    "How do I reach these keeeeds?"
  ],
  approved: [
    "I'm Not Just Sure, I'm HIV Positive"
  ],
  changes_requested: [
    "Boo, Wendy Testaburger! Boo!"
  ],
  closed: [
    "Screw you guys, I'm going home."
  ],
  bonus: [
    "Tsst!",
    "HOW WOULD YOU LIKE TO SUCK MY BALLS...Mr. Garrison",
    "Stan, don't you know the first law of physics? Anything that's fun costs at least eight dollars."
  ]
};

const recentlyUsed = [];
const MAX_RECENT = 5;

function pickRandom(arr) {
  // Filter out recently used quotes if possible
  const available = arr.filter(q => !recentlyUsed.includes(q));
  const pool = available.length > 0 ? available : arr;
  const quote = pool[Math.floor(Math.random() * pool.length)];

  recentlyUsed.push(quote);
  if (recentlyUsed.length > MAX_RECENT) {
    recentlyUsed.shift();
  }

  return quote;
}

function getQuote(action) {
  // 5% chance of bonus quote on any event
  if (Math.random() < 0.05) {
    return pickRandom(quotes.bonus);
  }

  switch (action) {
    case "opened":
      return pickRandom(quotes.opened);
    case "synchronize":
      return pickRandom(quotes.synchronize);
    case "review_requested":
      return pickRandom(quotes.review_requested);
    case "submitted_approved":
      return pickRandom(quotes.approved);
    case "submitted_changes_requested":
      return pickRandom(quotes.changes_requested);
    case "closed":
      return pickRandom(quotes.closed);
    default:
      return null;
  }
}

module.exports = { getQuote };
