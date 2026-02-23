const GOOGLE_MAPS_API_KEY = "AIzaSyA_c68g2GjVm93mE7XeLX5aNjf1lAw14Fk";

interface Place {
  name: string;
  type: string;
  lat: number;
  lng: number;
}

interface AtlasMapProps {
  center: [number, number];
  places?: Place[];
}

const AtlasMap = ({ center, places = [] }: AtlasMapProps) => {
  const [lat, lng] = center;
  
  const markers = places.map(p => `markers=color:red%7Clabel:${p.name.charAt(0)}%7C${p.lat},${p.lng}`).join("&");
  const src = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${lat},${lng}&zoom=14${places.length > 0 ? "" : ""}`;

  return (
    <div className="w-full h-[300px] rounded border border-border overflow-hidden">
      <iframe
        title="Atlas Map"
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default AtlasMap;
