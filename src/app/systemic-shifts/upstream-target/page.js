// src/app/systemic-shifts/upstream-target/page.js

import UpstreamTarget from '../../../components/UpstreamTarget';
import FadeInWhenVisible from '../../../components/animations/FadeInWhenVisible';

export default function UpstreamTargetPage() {
  return (
    <FadeInWhenVisible key="upstream-target">
      <section id="upstream-target">
        <UpstreamTarget />
      </section>
    </FadeInWhenVisible>
  );
}

