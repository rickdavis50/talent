import React from 'react';

import AppButton from './AppButton';
import iconProfile from '../assets/icon_profile.svg';

type TopBarProps = {
  onReset: () => void;
  onDownload: () => void;
  editMode: boolean;
  onToggleEdit: () => void;
  onProfile: () => void;
};

const TopBar: React.FC<TopBarProps> = ({
  onReset,
  onDownload,
  editMode,
  onToggleEdit,
  onProfile,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="text-4xl font-semibold font-display">Top Talent Tune-up</div>
          <AppButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={onProfile}
            aria-label="Edit profile"
            className="h-10 w-10 rounded-full"
          >
            <img src={iconProfile} alt="" className="h-5 w-5" aria-hidden="true" />
          </AppButton>
        </div>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Adjust each signal to see real-time strengths and gaps.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <AppButton
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleEdit}
          className="rounded-full px-4"
        >
          {editMode ? 'Done' : 'Edit'}
        </AppButton>
        <AppButton
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="rounded-full px-4"
        >
          Reset
        </AppButton>
        <AppButton
          type="button"
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="rounded-full px-4"
        >
          Download PDF
        </AppButton>
      </div>
    </div>
  );
};

export default TopBar;
