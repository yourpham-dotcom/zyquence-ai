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

const AtlasMap = ({ center }: AtlasMapProps) => {
  const [lat, lng] = center;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05},${lat - 0.03},${lng + 0.05},${lat + 0.03}&layer=mapnik&marker=${lat},${lng}`;

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
