import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

declare global {
  interface Window {
    audioStop: () => void;
  }
}

interface AvatarProps {
  callback: (stateKey: string, value: any) => void;
}

const Avatar = forwardRef(({ callback }: AvatarProps, ref) => {
  const { unityProvider, sendMessage } = useUnityContext({
    loaderUrl: "Build/public.loader.js",
    dataUrl: "Build/public.data.unityweb",
    frameworkUrl: "Build/public.framework.js.unityweb",
    codeUrl: "Build/public.wasm.unityweb",
  });

  useEffect(() => {
    window.audioStop = () => {
      console.log("Audio has stopped in Unity");
      callback("setIsTalking", false);
    };
  }, [callback]);

  useImperativeHandle(ref, () => ({
    sendUnityMessage: (
      gameObject: string,
      methodName: string,
      value: string | undefined
    ) => {
      sendMessage(gameObject, methodName, value);
    },
  }));

  return (
    <Unity
      unityProvider={unityProvider}
      style={{ width: "100%", aspectRatio: "1920/1080" }}
    />
  );
});

export default Avatar;
