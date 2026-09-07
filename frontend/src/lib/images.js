export const CATEGORY_IMAGES = {
  "Fitness & Gym": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  "Spa & Wellness": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
  "Hair & Beauty": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
  "Medical & Health": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
  "Career & Coaching": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  "Home Services": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
};

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80";

export const CATEGORY_GRADIENTS = {
  "Fitness & Gym": "from-orange-500 to-amber-400",
  "Spa & Wellness": "from-purple-500 to-fuchsia-400",
  "Hair & Beauty": "from-pink-500 to-rose-400",
  "Medical & Health": "from-emerald-500 to-green-400",
  "Career & Coaching": "from-blue-500 to-sky-400",
  "Home Services": "from-yellow-500 to-amber-400",
};

export function imageFor(typeName) {
  return CATEGORY_IMAGES[typeName] || HERO_IMAGE;
}

export function gradientFor(typeName) {
  return CATEGORY_GRADIENTS[typeName] || "from-accent-500 to-accent-600";
}
