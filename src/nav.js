export const buildItemLink = item => `?relativePath=${encodeURIComponent(item.relativePath)}`;

export const buildCatalogLink = catalog => `${buildItemLink(catalog)}&type=catalog`;