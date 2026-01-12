/*----- 取得 Place + 子 Places -----*/
export function getIncludedPlaceSlugs(places, currentPlaceSlug) {
  const currentPlace = places.find((place) => place.slug === currentPlaceSlug);

  if (!currentPlace) {
    return [];
  }

  if (currentPlace.parent_slug) {
    return [currentPlace.slug];
  } else {
    const childrenPlaceSlug = places
      .filter((place) => place.parent_slug === currentPlace.slug)
      .map((place) => place.slug);

    return [currentPlace.slug, ...childrenPlaceSlug];
  }
}
