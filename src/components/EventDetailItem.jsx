const EventDetailItem = ({ icon, alt, label }) => {
  return (
    <div className="flex-row gap-2 items-center">
      <img src={icon} alt={alt} width={17} height={17} className="mb-2" />

      <p className="mb-4">{label}</p>
    </div>
  );
};

export default EventDetailItem;
