import { Room, Experience } from '../types';

export const ROOMS: Room[] = [
  {
    id: 'hearth-suite',
    title: 'The Hearth Suite',
    tagline: 'Velvet Shadows & Open Flames',
    description: 'A masterfully crafted space featuring deep-toned local woodwork and an grand stone fireplace. Perfect for long conversations late into the night, wrapped in heavy wool blankets while the fire dances against the walls.',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    lightingStyle: 'mood-lighting',
    pricePerNight: 24500,
    capacity: '2 Guests',
    features: ['Grand Stone Fireplace', 'Hand-carved Khatamband Ceiling', 'Plush King Bed', 'Traditional Saffron Brew Station', 'Forest-Facing Sitting Area']
  },
  {
    id: 'valley-view-cabin',
    title: 'The Valley View Cabin',
    tagline: 'Where the Horizon Meets the Hearth',
    description: "Framed by massive floor-to-ceiling glass that captures Kashmir's moody, dramatic twilight. Inside, the world recedes into intimate, cozy corners lit by low, warm amber tones.",
    imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
    lightingStyle: 'atmospheric',
    pricePerNight: 28000,
    capacity: '3 Guests',
    features: ['Floor-to-Ceiling Panoramic Windows', 'Private Heated Wooden Deck', 'Cozy Reading Nook with Light Leaks', 'En-suite Luxury Stone Bath', 'Hand-loomed Pashmina Accents']
  }
];

export const EXPERIENCES: Experience[] = [
  {
    id: 'twilight-lake',
    title: 'Twilight on the Lake',
    description: 'Watch the valley transition from day to night. Drift across rain-slicked waters on a traditional wooden Shikara as the sky bleeds into deep neon blues and pinks, reflecting the ancient spirit of the mountains.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
    category: 'Misty Romance',
    duration: '3 Hours'
  },
  {
    id: 'kahwa-circle',
    title: 'The Kahwa Circle',
    description: 'Gather around the traditional copper Samovar as morning mist clings to the pine trees. Sip slow-brewed green tea infused with saffron, almonds, and cardamom while swapping stories with your hosts.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    category: 'Local Connection',
    duration: 'Every Morning'
  },
  {
    id: 'artisan-walk',
    title: 'The Artisan\'s Heritage Trail',
    description: 'Walk through Srinagar\'s old quarters. Visit family ateliers hand-carving walnut wood and weaving exquisite, side-lit wool pashminas that showcase generations of fine Kashmiri mastery.',
    imageUrl: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80',
    category: 'Tactile Heritage',
    duration: 'Half Day'
  }
];

export interface GuidePage {
  id: string;
  title: string;
  subtitle: string;
  chapter: string;
  category: string;
  content: {
    heading: string;
    body: string;
    items?: { title: string; desc: string }[];
  }[];
  imageUrl: string;
}

export const GUIDE_PAGES: GuidePage[] = [
  {
    id: 'letter',
    title: 'A Letter from the Hearth',
    subtitle: 'Welcome to Valley Life',
    chapter: 'Introduction',
    category: 'Philosophy',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    content: [
      {
        heading: 'Kashmir, Through Our Eyes',
        body: 'Kashmir is not a place you see; it is a place you feel. We have put together this guide to help you find the rhythm of the valley—the quiet corners, the oldest tea shops, and the views that haven\'t changed in a hundred years. Take your time. The mountains aren\'t going anywhere.'
      },
      {
        heading: 'A Guest Is a Gift',
        body: 'In our home, a guest is considered a light sent from above. We don\'t believe in booking confirmations or transactional keys. We invite you to sit with us by the cedar hearth, warm your hands, and allow yourself to slow down.'
      }
    ]
  },
  {
    id: 'morning-ritual',
    title: 'The Morning Ritual',
    subtitle: 'A sensory start to the valley day',
    chapter: 'Chapter I',
    category: 'Culinary Secrets',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    content: [
      {
        heading: 'The Kandur (The Local Baker)',
        body: 'Don\'t just go to a fast cafe. Follow the smell of cedar woodfire at 7:00 AM. In every local neighborhood, the Kandur (traditional clay oven baker) prepares crispy Bakarkhani and soft, pillowy Girda bread. Grab them steaming hot, wrap them in a tea towel, and rush back.'
      },
      {
        heading: 'The Saffron Secret',
        body: 'Traditional Kashmiri Kahwa is slow-brewed in a high-necked copper Samovar. Saffron threads, cinnamon bark, and crushed green cardamom are simmered, then poured over slivered almonds and sweet local honey. Sip it in silence while the mist clears.'
      }
    ]
  },
  {
    id: 'beyond-postcards',
    title: 'Beyond the Postcards',
    subtitle: 'Where Srinagar is still wild',
    chapter: 'Chapter II',
    category: 'The Un-Tourist Map',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
    content: [
      {
        heading: 'The Secret Canals of Rainawari',
        body: 'Skip the crowded houseboats on the main lake front. Instead, hire a small, quiet wooden Shikara boat at dusk to glide through the narrow back-waters of Rainawari. Here, ancient willow trees hang low, lotus pads are thick, and the local lake-dwellers live in wooden houses on stilts.'
      },
      {
        heading: 'Shehr-e-Khaas (The Old City Walk)',
        body: 'Stroll past the copper markets of Zaina Kadal. Listen to the rhythmic hammering of craftsmen shaping pots from raw metal sheets. Grab a spiced potato samosa, cross the wooden bridges, and feel the heartbeat of antiquity.'
      }
    ]
  },
  {
    id: 'artisan-path',
    title: 'The Artisan\'s Path',
    subtitle: 'A legacy made by hand',
    chapter: 'Chapter III',
    category: 'Heritage Craftsmanship',
    imageUrl: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80',
    content: [
      {
        heading: 'The Loom and the Weaver',
        body: 'A single, high-fidelity Pashmina shawl can take up to six months to hand-loom. In Srinagar, small family cooperatives weave wool sheared from high-altitude Himalayan goats, hand-inking delicate floral borders. Look for raw edges and slight irregularities—they prove the hand\'s presence.'
      },
      {
        heading: 'Khatamband Wooden Ceilings',
        body: 'Take a close look at our ceilings. They are created out of thousands of tiny, tongue-and-groove walnut wood pieces, fit together without a single nail. It is a mathematical mosaic that has decorated Kashmiri sanctuaries since the 14th century.'
      }
    ]
  }
];
