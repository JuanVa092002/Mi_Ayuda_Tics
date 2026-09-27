import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { LaunchVideoProps, DEFAULT_LAUNCH_PROPS } from './data/scriptData';
import { Caption } from './components/Caption';
import { VOICEOVER_META } from './content/voiceover-es-CO';

import { Scene01Hook } from './scenes/Scene01Hook';
import { Scene02Positioning } from './scenes/Scene02Positioning';
import { Scene03FuncionarioReport } from './scenes/Scene03FuncionarioReport';
import { Scene04ImmediateTrust } from './scenes/Scene04ImmediateTrust';
import { Scene05WebLeader } from './scenes/Scene05WebLeader';
import { Scene06TechnicianField } from './scenes/Scene06TechnicianField';
import { Scene07ProgressPartial } from './scenes/Scene07ProgressPartial';
import { Scene08VerifiableSolution } from './scenes/Scene08VerifiableSolution';
import { Scene09CompleteProduct } from './scenes/Scene09CompleteProduct';
import { Scene10CTA } from './scenes/Scene10CTA';

export const MainHorizontal: React.FC<LaunchVideoProps> = (props) => {
  const finalProps = { ...DEFAULT_LAUNCH_PROPS, ...props };

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {finalProps.voiceoverEnabled && (
        <Audio src={staticFile(VOICEOVER_META.audioFile)} />
      )}

      <div
        style={{
          width: 1080,
          height: 1920,
          transform: 'scale(0.5625)',
          transformOrigin: 'center center',
          position: 'relative',
        }}
      >
        <Sequence from={0} durationInFrames={180}>
          <Scene01Hook />
        </Sequence>
        <Sequence from={180} durationInFrames={363}>
          <Scene02Positioning />
        </Sequence>
        <Sequence from={543} durationInFrames={219}>
          <Scene03FuncionarioReport />
        </Sequence>
        <Sequence from={762} durationInFrames={164}>
          <Scene04ImmediateTrust />
        </Sequence>
        <Sequence from={926} durationInFrames={175}>
          <Scene05WebLeader />
        </Sequence>
        <Sequence from={1101} durationInFrames={180}>
          <Scene06TechnicianField />
        </Sequence>
        <Sequence from={1281} durationInFrames={227}>
          <Scene07ProgressPartial />
        </Sequence>
        <Sequence from={1508} durationInFrames={187}>
          <Scene08VerifiableSolution />
        </Sequence>
        <Sequence from={1695} durationInFrames={180}>
          <Scene08VerifiableSolution />
        </Sequence>
        <Sequence from={1875} durationInFrames={188}>
          <Scene09CompleteProduct />
        </Sequence>
        <Sequence from={2063} durationInFrames={487}>
          <Scene10CTA
            ctaText={finalProps.ctaText}
            ctaUrl={finalProps.ctaUrl}
            showQr={finalProps.showQr}
          />
        </Sequence>
      </div>

      {finalProps.captionsEnabled && <Caption layout="horizontal" />}
    </div>
  );
};
