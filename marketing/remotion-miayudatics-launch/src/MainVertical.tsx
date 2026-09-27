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

export const MainVertical: React.FC<LaunchVideoProps> = (props) => {
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

      {/* Scene 1 — Hook: voz 0.10–5.25s */}
      <Sequence from={0} durationInFrames={180}>
        <Scene01Hook />
      </Sequence>

      {/* Scene 2 — Problema y posicionamiento: voz 6.00–17.35s */}
      <Sequence from={180} durationInFrames={363}>
        <Scene02Positioning />
      </Sequence>

      {/* Scene 3 — Funcionario: voz 18.10–24.75s */}
      <Sequence from={543} durationInFrames={219}>
        <Scene03FuncionarioReport />
      </Sequence>

      {/* Scene 4 — Código: voz 25.40–30.15s */}
      <Sequence from={762} durationInFrames={164}>
        <Scene04ImmediateTrust />
      </Sequence>

      {/* Scene 5 — Líder TIC web: voz 30.85–36.00s */}
      <Sequence from={926} durationInFrames={175}>
        <Scene05WebLeader />
      </Sequence>

      {/* Scene 6 — Técnico: voz 36.70–42.10s */}
      <Sequence from={1101} durationInFrames={180}>
        <Scene06TechnicianField />
      </Sequence>

      {/* Scene 7 — Solución parcial: voz 42.70–49.50s */}
      <Sequence from={1281} durationInFrames={227}>
        <Scene07ProgressPartial />
      </Sequence>

      {/* Scene 8 — Solución total: voz 50.25–55.80s */}
      <Sequence from={1508} durationInFrames={187}>
        <Scene08VerifiableSolution />
      </Sequence>

      {/* Scene 9 — Confirmación: voz 56.50–61.35s */}
      <Sequence from={1695} durationInFrames={180}>
        <Scene08VerifiableSolution />
      </Sequence>

      {/* Scene 10a — Producto completo: voz 62.50–67.70s */}
      <Sequence from={1875} durationInFrames={188}>
        <Scene09CompleteProduct />
      </Sequence>

      {/* Scene 10b — Cierre y hold de marca hasta 85s */}
      <Sequence from={2063} durationInFrames={487}>
        <Scene10CTA
          ctaText={finalProps.ctaText}
          ctaUrl={finalProps.ctaUrl}
          showQr={finalProps.showQr}
        />
      </Sequence>

      {finalProps.captionsEnabled && <Caption layout="vertical" />}
    </div>
  );
};
