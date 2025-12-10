import { Hero, HeroProps } from './Hero';

export const HeroNeon = (props: Omit<HeroProps, 'stylePreset' | 'motionPreset'>) => {
  return (
    <Hero 
      {...props} 
      stylePreset="neon" 
      motionPreset="spotlight" 
    />
  );
};

export default HeroNeon;
