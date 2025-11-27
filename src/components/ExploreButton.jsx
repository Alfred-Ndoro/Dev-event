const ExploreButton = () => {
  return (
    <buttn id="explore-btn" type="button" className="mt-7 mx-auto">
      <a href="#events">
        Explore Events
        <img
          src="/icons/arrow-down.svg"
          alt="arrow-down"
          width={24}
          height={24}
        />
      </a>
    </buttn>
  );
};

export default ExploreButton;
