import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { LaunchVideoProps, DEFAULT_LAUNCH_PROPS } from './data/scriptData';
import { Caption } from './components/Caption';
import { VOICEOVER_META } from './content/voiceover-es-CO';

import { Scene01Hook } from './scenes/Scene01Hook';
import { Scene02Positioning } from './scenes/Scene02Positioning';
import { Scene03FuncionarioReport } from './scenes/Scene03FuncionarioReport';

export const PreviewShort: React.FC<LaunchVideoProps> = (props) => {
  const finalProps = { ...DEFAULT_LAUNCH_PROPS, ...props };

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {finalProps.voiceoverEnabled && (
        <Audio src={staticFile(VOICEOVER_META.audioFile)} />
      )}

      <Sequence from={0} durationInFrames={180}>
        <Scene01Hook />
      </Sequence>
      <Sequence from={180} durationInFrames={363}>
        <Scene02Positioning />
      </Sequence>
      <Sequence from={543} durationInFrames={237}>
        <Scene03FuncionarioReport />
      </Sequence>

      {finalProps.captionsEnabled && <Caption layout="vertical" />}
    </div>
  );
};
