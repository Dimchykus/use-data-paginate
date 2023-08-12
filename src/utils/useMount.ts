import { DependencyList, EffectCallback, useEffect, useRef } from "react";

const useIsMount = (callback: EffectCallback, dependencies: DependencyList) => {
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return isFirstRenderRef.current;
};

export default useIsMount;
