import React from 'react';
import { Composition } from 'remotion';
import { MainVertical } from './MainVertical';
import { MainHorizontal } from './MainHorizontal';
import { PreviewShort } from './PreviewShort';
import { DEFAULT_LAUNCH_PROPS } from './data/scriptData';

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

export const Root: React.FC = () => {
  return (
    <>
      {/* 1. Main Vertical Launch Video (9:16, 1080x1920, 85s @ 30fps) */}
      <Composition
        id="MiAyudaTICLaunchVertical"
        component={MainVertical}
        durationInFrames={2550}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_LAUNCH_PROPS}
      />

      {/* 2. Derived Horizontal Architecture (16:9, 1920x1080, 85s @ 30fps) */}
      <Composition
        id="MiAyudaTICLaunchHorizontal"
        component={MainHorizontal}
        durationInFrames={2550}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={DEFAULT_LAUNCH_PROPS}
      />

      {/* 3. Short Validation Preview (26s, hook → funcionario) */}
      <Composition
        id="PreviewShort"
        component={PreviewShort}
        durationInFrames={780}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_LAUNCH_PROPS}
      />

      {/* Full review-only preview. Never use this output as distribution master. */}
      <Composition
        id="PreviewFullWithVoice"
        component={MainVertical}
        durationInFrames={2550}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_LAUNCH_PROPS}
      />

      {/* Individual Scene Compositions for isolated preview */}
      <Composition
        id="Scene01-Hook"
        component={Scene01Hook}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Scene02-Positioning"
        component={Scene02Positioning}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Scene03-Funcionario"
        component={Scene03FuncionarioReport}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Scene04-Trust"
        component={Scene04ImmediateTrust}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Scene05-WebLeader"
        component={Scene05WebLeader}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Scene06-Technician"
        component={Scene06TechnicianField}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Scene07-Progress"
        component={Scene07ProgressPartial}
        durationInFrames={330}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Scene08-Solution"
        component={Scene08VerifiableSolution}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Scene09-Ecosystem"
        component={Scene09CompleteProduct}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Scene10-CTA"
        component={Scene10CTA}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_LAUNCH_PROPS}
      />
    </>
  );
};
