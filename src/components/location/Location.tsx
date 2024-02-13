import React, { useEffect, useRef } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

interface KakaoLocationProps {
  apiKey: string;
  center: {
    lat: number;
    lng: number;
    level: number;
  };
  style: React.CSSProperties;
  initialLevel: number;
  initialLat: string;
  initialLng: string;
  onClick: (lat: number, lng: number) => void;
}

const KakaoLocation: React.FC<KakaoLocationProps> = (props) => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Kakao 지도 API 초기화 및 설정
    window.kakao.maps.load(() => {
      const mapOptions = {
        center: new window.kakao.maps.LatLng(props.center.lat, props.center.lng),
        level: props.center.level,
      };
      const mapElement = mapRef.current;

      if (mapElement) {
        const map = new window.kakao.maps.Map(mapElement, mapOptions);

        // 지도 클릭 이벤트 등록
        window.kakao.maps.event.addListener(map, 'click', (e: any) => {
          const latitude = e.latLng.getLat();
          const longitude = e.latLng.getLng();

          // onClick 이벤트 처리
          if (props.onClick) {
            props.onClick(latitude, longitude);
          }
        });
      }
    });
  }, [props.apiKey, props.center.lat, props.center.lng, props.center.level, props.onClick]);

  return (
    <div
      ref={mapRef}
      style={props.style || { width: '350px', height: '350px' }}
      key={`${props.center.lat}-${props.center.lng}`}
    >
      {/* Map component and markers go here */}
    </div>
  );
};

export default KakaoLocation;
