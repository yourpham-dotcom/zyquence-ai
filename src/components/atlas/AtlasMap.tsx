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
  searchQuery?: string;
}

const AtlasMap = ({ center, places = [], searchQuery }: AtlasMapProps) => {
  const [lat, lng] = center;

  const src = searchQuery?.trim()
    ? `https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(searchQuery)}&center=${lat},${lng}&zoom=14`
    : `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${lat},${lng}&zoom=14`;

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
