// UnityGameComponent.jsx
import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

const Avatar = () => {
  const { unityProvider, isLoaded } = useUnityContext({
    loaderUrl: "Build/public.loader.js",
    dataUrl: "Build/public.data.unityweb",
    frameworkUrl: "Build/public.framework.js.unityweb",
    codeUrl: "Build/public.wasm.unityweb",
  });
  return (
    <Unity
      unityProvider={unityProvider}
      style={{ width: "100%", aspectRatio: "1920/1080" }}
    />
  );
};

export default Avatar;
