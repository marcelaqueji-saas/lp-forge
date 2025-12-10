import { Hero, HeroProps } from './Hero';

export const HeroDark = (props: Omit<HeroProps, 'stylePreset' | 'motionPreset'>) => {
  return (
    <Hero 
      {...props} 
      stylePreset="dark" 
      motionPreset="fade-stagger" 
    />
  );
};

export default HeroDark;
