// src/app/systemic-shifts/key-shifts/page.js

import KeyShifts from '../../../components/KeyShifts';
import FadeInWhenVisible from '../../../components/animations/FadeInWhenVisible';

export default function KeyShiftsPage() {
  return (
    <FadeInWhenVisible key="key-shifts">
      <section id="key-shifts">
        <KeyShifts />
      </section>
    </FadeInWhenVisible>
  );
}

