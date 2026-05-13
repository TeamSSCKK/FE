let loaderPromise: Promise<void> | null = null;

export function loadNaverMapScript(clientId: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("SSR context — naver map script cannot load"));
  }
  if (window.naver?.maps) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  if (!clientId) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 미설정"),
    );
  }

  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${encodeURIComponent(clientId)}&submodules=geocoder`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loaderPromise = null;
      reject(new Error("naver map script load failed"));
    };
    document.head.appendChild(script);
  });

  return loaderPromise;
}
