import { Hero, HeroProps } from './Hero';

export const HeroMinimal = (props: Omit<HeroProps, 'stylePreset' | 'motionPreset'>) => {
  return (
    <Hero 
      {...props} 
      stylePreset="minimal" 
      motionPreset="fade-stagger" 
    />
  );
};

export default HeroMinimal;
