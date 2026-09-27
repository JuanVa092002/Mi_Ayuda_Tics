import React from 'react';
import { Sequence } from 'remotion';
import { Background } from './components/Background';
import { Scene1Hook } from './scenes/Scene1Hook';
import { Scene2Reveal } from './scenes/Scene2Reveal';
import { Scene3Mobile } from './scenes/Scene3Mobile';
import { Scene4Web } from './scenes/Scene4Web';
import { Scene5Architecture } from './scenes/Scene5Architecture';
import { Scene6Climax } from './scenes/Scene6Climax';

export const MainVideo: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Global Cinematic Background */}
      <Background />

      {/* Scene 1: The Problem / The Catalyst (0s - 7s | frames 0 - 210) */}
      <Sequence from={0} durationInFrames={210} name="Scene1_Problem">
        <Scene1Hook />
      </Sequence>

      {/* Scene 2: The Reveal / Web + Mobile Vision (7s - 14s | frames 210 - 420) */}
      <Sequence from={210} durationInFrames={210} name="Scene2_Reveal">
        <Scene2Reveal />
      </Sequence>

      {/* Scene 3: Mobile Experience (14s - 23s | frames 420 - 690) */}
      <Sequence from={420} durationInFrames={270} name="Scene3_Mobile">
        <Scene3Mobile />
      </Sequence>

      {/* Scene 4: Web Command Center (23s - 32s | frames 690 - 960) */}
      <Sequence from={690} durationInFrames={270} name="Scene4_Web">
        <Scene4Web />
      </Sequence>

      {/* Scene 5: Silicon Valley Architecture & Reliability (32s - 39s | frames 960 - 1170) */}
      <Sequence from={960} durationInFrames={210} name="Scene5_Architecture">
        <Scene5Architecture />
      </Sequence>

      {/* Scene 6: Grand Finale & Call To Action (39s - 45s | frames 1170 - 1350) */}
      <Sequence from={1170} durationInFrames={180} name="Scene6_Climax">
        <Scene6Climax />
      </Sequence>
    </div>
  );
};
