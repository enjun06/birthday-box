// ============================================================
// CONTENT & ASSET CONFIGURATION
// ============================================================

export const ASSETS = {
  music: {
    menu: { label: 'Menu Theme — Lofi Piano', src: null },
    stories: { label: 'Stories — Soft Strings', src: null },
    album: { label: 'Album — Nostalgic Guitar', src: null },
    journey: { label: 'Journey — Cinematic Ambient', src: null },
    postcard: { label: 'Postcard — Acoustic Love', src: null },
    secret: { label: 'Secret — Mysterious Piano', src: null },
    surprise: { label: 'Surprise — Playful Ukulele', src: null },
    daily: { label: 'Daily — Gentle Harp', src: null },
    wish: { label: 'Wish — Dreamy Synth', src: null },
    ending: { label: 'Ending — Emotional Crescendo', src: null },
    landing: { label: 'Landing — Anticipation', src: null },
  },
  albumImages: {},
  secretImages: {},
  videos: {},
};

// ============================================================
// LANDING SEQUENCE
// ============================================================
export const LANDING = {
  // The recipient's name — change this before deploying
  recipientName: 'Love',

  // Countdown target (month is 0-indexed: 5 = June)
  countdownTarget: (() => {
    const now = new Date();
    const year = now.getMonth() > 5 || (now.getMonth() === 5 && now.getDate() > 27) ? now.getFullYear() + 1 : now.getFullYear();
    return new Date(year, 5, 27, 0, 0, 0);
  })(),

  // Password to bypass countdown (click skip icon top-right)
  skipPassword: 'skip',

  // ---- Phase 1: countdown typing messages ----
  countdownMessages: [
    'Something wonderful is just around the corner…',
    'The best moments are worth the wait…',
    'Good things come to those who wait patiently…',
    'Every second brings us closer to something magical…',
    'Counting down to a moment that will last forever…',
    'Anticipation makes the heart grow fonder…',
    'Soon, very soon, the wait will all be worth it…',
    'The countdown has begun for something truly special…',
  ],

  // ---- Phase 2: intro + love quotes ----
  // {name} will be replaced with recipientName
  heyText: 'Hey, {name}… I\'ve been waiting for this moment.',

  loveQuotes: [
    'From the first time I saw you, I knew my world had changed forever.',
    'You are the calm in my chaos, the light in my darkest days.',
    'I promise to stand by your side — through every storm, through every sunrise.',
    'Even when we grow old and gray, I will still look at you the same way I do now.',
    'You don\'t just have my heart — you are my heart.',
    'No matter where life takes us, my hand will always reach for yours.',
  ],

  afterQuotes: [
    'And today… is all about you.',
    'Because you deserve the entire world.',
    'So here it is — a little something I built just for you.',
  ],

  // ---- Phase 3: birthday celebration ----
  // {name} will be replaced
  birthdayTitle: 'Happy Birthday, {name}! 🎂',
  birthdayMessage: 'May every wish you make today come true. May this year bring you more joy than your heart can hold. Thank you for simply existing — you make this world infinitely more beautiful. I love you, today and always.',

  ctaText: '🎉 Let\'s Celebrate!',
};

// ============================================================
// APP CONFIG
// ============================================================
export const CONFIG = {
  password: 'love',
  countdownTarget: LANDING.countdownTarget,

  surprises: [
    { icon: '💖', title: 'Heartfelt', body: 'You are the most beautiful part of my ordinary days.' },
    { icon: '✨', title: 'Shine Bright', body: 'Never forget how amazing you are. You light up every room.' },
    { icon: '🌸', title: 'Blossom', body: 'Like spring, you bring life and color wherever you go.' },
    { icon: '🌙', title: 'Moonlit', body: 'Even on dark nights, you are my steady light.' },
    { icon: '☀️', title: 'Sunshine', body: 'Your smile could outshine a thousand suns.' },
    { icon: '🎵', title: 'Melody', body: 'You are the song my heart never stops singing.' },
    { icon: '🌈', title: 'Rainbow', body: 'After every storm, you are the color that appears.' },
    { icon: '🕊️', title: 'Peace', body: 'With you, I have found my safest place.' },
    { icon: '⭐', title: 'Star', body: 'You are my favorite star in this whole universe.' },
    { icon: '🍀', title: 'Lucky', body: 'I am the luckiest person because I have you.' },
  ],

  dailyNotes: [
    'You are my sunshine on cloudy days.',
    'Your laugh is the sweetest melody.',
    'I love the way you crinkle your nose when you smile.',
    'You make ordinary moments feel extraordinary.',
    'Every day with you is a gift I treasure.',
    'You are the best thing that ever happened to me.',
    'I love you more than pizza. And that\'s a lot.',
    'You are my favorite person to annoy.',
    'Thank you for existing. Really.',
    'You are the reason I believe in magic.',
    'I love your messy hair and your messy heart.',
    'You make me want to be a better person.',
    'You are my happy place.',
    'I love the way your eyes sparkle when you talk.',
    'You are my favorite hello and hardest goodbye.',
    'I would choose you again and again.',
    'You are my internet. I\'m never disconnecting.',
    'Your hugs fix everything.',
    'I love your weird little dances.',
    'You are my favorite notification.',
    'I love the way you say my name.',
    'You are my most beautiful memory.',
    'I carry you with me everywhere I go.',
    'You make my heart feel so full.',
    'I love you to the moon and back. And back again.',
    'You are my favorite adventure.',
    'Happy birthday, my love. This note is just for you.',
  ],

  chatBubbles: [
    'You\'re amazing, you know that? 💕',
    'Psst… you\'re my favorite person ✨',
    'I hope you\'re smiling right now 🌸',
    'Just so you know… I love you 💖',
    'You make everything better 🌟',
    'You are so loved 🫶',
    'Hey pretty, happy birthday! 🎂',
    'You\'re the reason I believe in magic ✨',
    'Sending you a virtual hug 🤗',
    'You are my sunshine ☀️',
  ],

  stories: [
    { quote: 'Some memories are small, but somehow they stay forever.', hidden: 'Like the way you laugh at things that aren\'t even that funny. It\'s my favorite sound.', tag: '✨ forever', emoji: '💭' },
    { quote: 'You have this funny way of making ordinary days feel special.', hidden: 'A random Tuesday with you feels like a holiday. How do you do that?', tag: '🌸 everyday magic', emoji: '✨' },
    { quote: 'This is one of my favorite versions of us.', hidden: 'The one where we\'re sitting in silence but somehow still talking. That one.', tag: '💕 us', emoji: '💖' },
    { quote: 'I hope today feels as warm as the happiness you give me.', hidden: 'Because you deserve every bit of warmth, every single day.', tag: '🎂 birthday feels', emoji: '☀️' },
    { quote: 'You\'re the protagonist of my favorite story.', hidden: 'And I\'d read it a thousand times, just to get to the part where you smile.', tag: '📖 our story', emoji: '💫' },
  ],

  albumFrames: [
    { size: 'md', tilt: 'tilt-left', emoji: '🌅', caption: 'golden hour', label: 'us, somewhere' },
    { size: 'sm', tilt: 'tilt-right', emoji: '🌸', caption: 'bloom', label: 'spring' },
    { size: 'sm', tilt: 'tilt-left', emoji: '☕', caption: 'cozy', label: 'morning' },
    { size: 'lg', tilt: '', emoji: '🌊', caption: 'endless', label: 'our summer' },
    { size: 'sm', tilt: 'tilt-right', emoji: '🎵', caption: 'our song', label: 'playlist' },
    { size: 'md', tilt: 'tilt-left', emoji: '✨', caption: 'magic', label: 'that night' },
    { size: 'sm', tilt: 'tilt-right', emoji: '🍜', caption: 'comfort', label: 'late night' },
    { size: 'sm', tilt: 'tilt-left', emoji: '📸', caption: 'candid', label: 'real smile' },
  ],

  journeyMilestones: [
    { icon: '💬', title: 'First Chat', date: 'Sometime, somewhere', quote: 'It started with a simple hello.', gameType: 'pop' },
    { icon: '🤝', title: 'First Meeting', date: 'A day I\'ll never forget', quote: 'You were even more beautiful in person.', gameType: 'drag' },
    { icon: '😂', title: 'First Laugh', date: 'When I knew', quote: 'Your laugh is my favorite melody.', gameType: 'hold' },
    { icon: '🌟', title: 'Favorite Random Moment', date: 'Just because', quote: 'The ordinary ones are the best.', gameType: 'pop' },
    { icon: '💓', title: 'The Day Everything Felt Different', date: 'My heart knew', quote: 'Something shifted. In the best way.', gameType: 'connect' },
    { icon: '🌙', title: 'A Moment I Always Remember', date: 'Etched in my mind', quote: 'I replay it often.', gameType: 'hold' },
    { icon: '🎂', title: 'Today, Your Birthday', date: 'The main event', quote: 'This whole world is for you.', gameType: 'reveal' },
  ],

  postcards: [
    { emoji: '🌅', caption: 'our sunrise', rot: -4, frontLabel: 'Our sunrise', frontIcon: '🌅', letter: 'Every sunrise with you feels like a new beginning.\n\nThank you for all the mornings you made brighter just by being there.\n\nI love you.' },
    { emoji: '🌙', caption: 'stargazing', rot: 3, frontLabel: 'Stargazing', frontIcon: '🌙', letter: 'Under the same sky, we shared a million stars.\n\nSome nights we talked, some we just sat in silence — but every moment was magic.\n\nYou are my favorite constellation.' },
    { emoji: '☕', caption: 'coffee dates', rot: -2, frontLabel: 'Coffee dates', frontIcon: '☕', letter: 'Coffee never tasted as good as when I\'m with you.\n\nThose quiet afternoons, the laughter, the way you steal my drink…\n\nI\'d choose those moments forever.' },
    { emoji: '📚', caption: 'quiet moments', rot: 5, frontLabel: 'Quiet moments', frontIcon: '📚', letter: 'In the quiet, I notice everything about you.\n\nThe way you hum when you read, the little smile when you\'re lost in a page.\n\nThose are the moments I treasure most.' },
    { emoji: '🌸', caption: 'spring walks', rot: -3, frontLabel: 'Spring walks', frontIcon: '🌸', letter: 'Walking beside you, the world felt softer.\n\nCherry blossoms, warm breeze, your hand in mine.\n\nEvery step was a memory I want to keep forever.' },
    { emoji: '🎵', caption: 'our playlist', rot: 2, frontLabel: 'Our playlist', frontIcon: '🎵', letter: 'Every song reminds me of a moment with you.\n\nSome make me laugh, some make me tear up.\n\nBut all of them are ours. Thank you for the music we created together.' },
  ],
};
