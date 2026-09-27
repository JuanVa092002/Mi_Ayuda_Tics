import React from 'react';
import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';
import { Scene1Hook } from './scenes/Scene1Hook';
import { Scene2Reveal } from './scenes/Scene2Reveal';
import { Scene3Mobile } from './scenes/Scene3Mobile';
import { Scene4Web } from './scenes/Scene4Web';
import { Scene5Architecture } from './scenes/Scene5Architecture';
import { Scene6Climax } from './scenes/Scene6Climax';
import { Background } from './components/Background';

// Wrapper for scene-level preview with background
const SceneWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
    <Background />
    {children}
  </div>
);

export const Root: React.FC = () => {
  return (
    <>
      {/* Complete 45s Silicon Valley Showcase Video */}
      <Composition
        id="MiAyudaTicsProduct"
        component={MainVideo}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Individual Scene Compositions for quick iteration & social media cuts */}
      <Composition
        id="Scene1-Problem"
        component={() => (
          <SceneWrapper>
            <Scene1Hook />
          </SceneWrapper>
        )}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Scene2-Reveal"
        component={() => (
          <SceneWrapper>
            <Scene2Reveal />
          </SceneWrapper>
        )}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Scene3-Mobile"
        component={() => (
          <SceneWrapper>
            <Scene3Mobile />
          </SceneWrapper>
        )}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Scene4-Web"
        component={() => (
          <SceneWrapper>
            <Scene4Web />
          </SceneWrapper>
        )}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Scene5-Architecture"
        component={() => (
          <SceneWrapper>
            <Scene5Architecture />
          </SceneWrapper>
        )}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Scene6-Climax"
        component={() => (
          <SceneWrapper>
            <Scene6Climax />
          </SceneWrapper>
        )}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
