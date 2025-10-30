// src/app/nexushub/dropbox/page.js

// This import path assumes your SystemicShiftsDropbox.js file is in src/components/
import SystemicShiftsDropbox from '../../../components/SystemicShiftsDropbox';

export default function DropboxPage() {
  // This renders your Dropbox component, which
  // already includes the login check logic.
  return <SystemicShiftsDropbox />;
}
