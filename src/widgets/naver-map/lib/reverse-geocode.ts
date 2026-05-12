import type { LatLng } from "../model/types";

export interface ReverseGeocodeResult {
  roadAddress: string;
  jibunAddress: string;
}

export function reverseGeocode(latlng: LatLng): Promise<ReverseGeocodeResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.naver?.maps?.Service) {
      return reject(new Error("naver maps Service 미초기화"));
    }
    const { naver } = window;
    naver.maps.Service.reverseGeocode(
      {
        coords: new naver.maps.LatLng(latlng.lat, latlng.lng),
        orders: [
          naver.maps.Service.OrderType.ROAD_ADDR,
          naver.maps.Service.OrderType.ADDR,
        ].join(","),
      },
      (status: number, response: any) => {
        if (status !== naver.maps.Service.Status.OK) {
          return reject(new Error("reverseGeocode failed"));
        }
        const results = response?.v2?.results ?? [];
        const road = results.find((r: any) => r.name === "roadaddr");
        const jibun = results.find((r: any) => r.name === "addr");
        resolve({
          roadAddress: road ? formatAddress(road) : "",
          jibunAddress: jibun ? formatAddress(jibun) : "",
        });
      },
    );
  });
}

function formatAddress(item: any): string {
  const region = item.region;
  const land = item.land;
  if (!region) return "";
  const area = [region.area1?.name, region.area2?.name, region.area3?.name, region.area4?.name]
    .filter(Boolean)
    .join(" ");
  if (!land) return area;
  const number = [land.number1, land.number2 ? `-${land.number2}` : ""].filter(Boolean).join("");
  const roadName = land.name;
  if (roadName) return `${area} ${roadName} ${number}`.trim();
  return `${area} ${number}`.trim();
}
