// src/app/systemic-shifts/mindset-behaviour/page.js

import MindsetBehaviour from '../../../components/MindsetBehaviour';
import FadeInWhenVisible from '../../../components/animations/FadeInWhenVisible';

export default function MindsetBehaviourPage() {
  return (
    <FadeInWhenVisible key="mindset-behaviour">
      <section id="mindset-behaviour">
        <MindsetBehaviour />
      </section>
    </FadeInWhenVisible>
  );
}

