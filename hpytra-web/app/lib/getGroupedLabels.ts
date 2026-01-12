export function getGroupedLabels(labels) {
  const groupedLabels = {
    special: [],
    water: [],
    kids: [],
    transport: [],
  };

  /* 將 Labels 加入對應的分類陣列中 */
  labels.forEach((label) => {
    if (groupedLabels[label.category]) {
      groupedLabels[label.category].push(label);
    }
  });

  return groupedLabels;
}
