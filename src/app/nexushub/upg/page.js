// src/app/nexushub/upg/page.js

import UpstreamGallery from '../../../components/UpstreamGallery';
import FadeInWhenVisible from '../../../components/animations/FadeInWhenVisible';

export default function UPGPage() {
  return (
    <FadeInWhenVisible key="upg">
      <section id="upg">
        <UpstreamGallery />
      </section>
    </FadeInWhenVisible>
  );
}
