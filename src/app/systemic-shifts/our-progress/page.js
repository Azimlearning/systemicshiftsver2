// src/app/systemic-shifts/our-progress/page.js

import OurProgress from '../../../components/OurProgress';
import FadeInWhenVisible from '../../../components/animations/FadeInWhenVisible';

export default function OurProgressPage() {
  return (
    <FadeInWhenVisible key="our-progress">
      <section id="our-progress">
        <OurProgress />
      </section>
    </FadeInWhenVisible>
  );
}

