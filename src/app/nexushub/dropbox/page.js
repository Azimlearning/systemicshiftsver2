// src/app/nexushub/dropbox/page.js

import SystemicShiftsDropbox from '../../../components/SystemicShiftsDropbox';
import FadeInWhenVisible from '../../../components/animations/FadeInWhenVisible';

export default function DropboxPage() {
  return (
    <FadeInWhenVisible key="dropbox">
      <section id="dropbox">
        <SystemicShiftsDropbox />
      </section>
    </FadeInWhenVisible>
  );
}
