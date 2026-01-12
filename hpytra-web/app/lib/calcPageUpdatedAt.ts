export function calcPageUpdatedAt(pageContent, hotelsForPage) {
  const articleUpdatedAt = pageContent?.updated_at
    ? new Date(pageContent.updated_at)
    : null;

  const hotelsUpdatedAt = hotelsForPage.map(
    (hotel) => new Date(hotel.updated_at)
  );

  const pageUpdatedAt = new Date(
    Math.max(
      ...(articleUpdatedAt ? [articleUpdatedAt.getTime()] : []),
      ...hotelsUpdatedAt.map((d) => d.getTime())
    )
  );
  return pageUpdatedAt;
}
