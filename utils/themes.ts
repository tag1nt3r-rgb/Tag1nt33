
export type ThemeKey = 'animals' | 'flowers' | 'cars' | 'landmarks' | 'shapes' | 'cocktails' | 'toys' | 'cartoons' | 'sports';

interface ThemeDef {
  id: ThemeKey;
  label: string;
  prompts: string[]; // 7 distinct prompts for IDs 1-7
}

export const THEMES: ThemeDef[] = [
  {
    id: 'animals',
    label: 'Životinje',
    prompts: ['majestic lion face', 'wild elephant', 'bald eagle portrait', 'jumping dolphin', 'giant panda', 'bengal tiger', 'grey wolf']
  },
  {
    id: 'flowers',
    label: 'Cvijeće',
    prompts: ['red rose macro', 'yellow sunflower field', 'purple tulip', 'white orchid', 'white daisy flower', 'pink lotus flower', 'lavender bunch']
  },
  {
    id: 'cars',
    label: 'Europski Automobili',
    prompts: ['red ferrari sports car', 'classic porsche 911', 'green mini cooper', 'vintage volkswagen beetle', 'blue bmw m3', 'black mercedes g-wagon', 'white fiat 500 classic']
  },
  {
    id: 'landmarks',
    label: 'Gradske Znamenitosti',
    prompts: ['eiffel tower paris', 'big ben london', 'colosseum rome', 'statue of liberty new york', 'taj mahal india', 'sydney opera house', 'kremlin moscow']
  },
  {
    id: 'shapes',
    label: 'Geometrijski Oblici',
    prompts: ['simple red circle 3d', 'blue square 3d', 'green triangle 3d', 'yellow star shape 3d', 'purple hexagon 3d', 'orange pentagon 3d', 'cyan diamond shape 3d']
  },
  {
    id: 'cocktails',
    label: 'Kokteli',
    prompts: ['mojito cocktail mint', 'margarita cocktail lime', 'martini with olive', 'pina colada pineapple', 'cosmopolitan cocktail', 'whiskey old fashioned', 'blue lagoon cocktail']
  },
  {
    id: 'toys',
    label: 'Igračke',
    prompts: ['cute teddy bear', 'colorful lego bricks', 'rubiks cube', 'red yo-yo toy', 'toy race car', 'spinning top toy', 'yellow rubber duck']
  },
  {
    id: 'cartoons',
    label: 'Crtani Likovi',
    prompts: ['cute cartoon mouse', 'cartoon rabbit eating carrot', 'cartoon yellow sponge', 'cartoon electric yellow mouse', 'cartoon cat chasing mouse', 'cartoon mystery dog great dane', 'cartoon yellow family man']
  },
  {
    id: 'sports',
    label: 'Sportski Rekviziti',
    prompts: ['classic soccer ball', 'basketball ball', 'tennis racket and ball', 'baseball bat and ball', 'american football helmet', 'golf club and ball', 'red boxing gloves']
  }
];

export const getThemeImageSrc = (themeId: ThemeKey, imageId: number): string => {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  // imageId is 1-7, array is 0-6.
  const prompt = theme.prompts[(imageId - 1) % 7];
  // Encode prompt and add a seed based on the prompt to ensure consistency across re-renders
  const encodedPrompt = encodeURIComponent(prompt);
  // Using pollinations.ai for dynamic generation. 
  // We add 'nologo=true' and 'width/height' params.
  // We add a seed to ensure the image stays the same for the session/user.
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=200&height=200&nologo=true&seed=${imageId * 123}`;
};
